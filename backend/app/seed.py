import argparse
import json
from pathlib import Path

from sqlalchemy import delete, select

from .database import Base, SessionLocal, engine
from .models import Banner, Category, Plan, Product, ProductCategory, TopBelt

ROOT = Path(__file__).resolve().parents[2]
JSON_DIR = ROOT / 'src' / 'json'
SEED_MODELS = (ProductCategory, Category, Banner, TopBelt, Plan, Product)

def load(name):
    with (JSON_DIR / name).open(encoding='utf-8') as file:
        return json.load(file)

def collect_products(value):
    if isinstance(value, dict):
        if value.get('product_id') and value.get('product_name'):
            return [value]
        result = []
        for child in value.values():
            result.extend(collect_products(child))
        return result
    if isinstance(value, list):
        result = []
        for child in value:
            result.extend(collect_products(child))
        return result
    return []

def make_product(raw, detail_by_id):
    product_id = int(raw['product_id'])
    return Product(
        product_id=product_id,
        product_name=raw.get('product_name') or '',
        code=raw.get('code'),
        sell_price=int(raw.get('sell_price') or 0),
        retail_price=int(raw.get('retail_price') or raw.get('sell_price') or 0),
        sale_state=str(raw.get('sale_state')) if raw.get('sale_state') is not None else None,
        total_stock=int(raw.get('total_stock') or 0),
        shipping_type=raw.get('shipping_type'),
        review_count=int(raw.get('review_count') or 0),
        review_score=float(raw.get('review_score') or 0),
        is_detail=product_id in detail_by_id,
        raw_data=raw,
        detail_data=detail_by_id.get(product_id),
    )

def seed(reset=False):
    product_source = load('products_info.json')
    plan_source = load('main_plan.json')
    banner_source = load('main_banner_and_products.json')
    belt_source = load('main_top_belt.json')

    detail_rows = product_source.get('data', {}).get('rows', [])
    detail_by_id = {int(item['product_id']): item for item in detail_rows}
    main_categories = banner_source.get('data', {}).get('1_DISPLAY_MAIN_PRODUCT', {})

    products_by_id = {}
    for item in detail_rows:
        products_by_id[int(item['product_id'])] = item
    for item in collect_products(plan_source.get('data', {})):
        products_by_id[int(item['product_id'])] = item
    for category in main_categories.values():
        for item in category.get('products', []):
            products_by_id[int(item['product_id'])] = item

    Base.metadata.create_all(engine)
    with SessionLocal() as session:
        has_data = any(session.scalar(select(model).limit(1)) is not None for model in SEED_MODELS)
        if has_data and not reset:
            raise RuntimeError('Seed target already contains data. Re-run with --reset to replace it.')
        if reset:
            for model in SEED_MODELS:
                session.execute(delete(model))
            session.flush()

        for raw in products_by_id.values():
            session.add(make_product(raw, detail_by_id))
        session.flush()

        for order, (key, value) in enumerate(main_categories.items()):
            category = Category(
                key=key,
                name=value.get('name') or key,
                sort_order=order,
                raw_data={k: v for k, v in value.items() if k != 'products'},
            )
            session.add(category)
            session.flush()
            for product_order, product in enumerate(value.get('products', [])):
                session.add(ProductCategory(
                    category_id=category.id,
                    product_id=int(product['product_id']),
                    sort_order=product_order,
                ))

        plan_groups = plan_source.get('data', {})
        for group_key in ('1_PLAN_0', '1_PLAN_1'):
            for order, entry in enumerate(plan_groups.get(group_key, [])):
                raw_plan = entry.get('plan') or {}
                session.add(Plan(
                    plan_id=int(raw_plan['plan_id']),
                    group_key=group_key,
                    sort_order=order,
                    name=raw_plan.get('name') or '',
                    title=raw_plan.get('title'),
                    sub_name=raw_plan.get('sub_name'),
                    start_at=raw_plan.get('start_at'),
                    end_at=raw_plan.get('end_at'),
                    thumbnail_url=raw_plan.get('plan_thumbnail_image_full') or raw_plan.get('plan_thumbnail_image'),
                    pc_content=raw_plan.get('pc_content'),
                    raw_plan={k: v for k, v in raw_plan.items() if k != 'pc_content'},
                    point=entry.get('point') or [],
                    raw_entry={k: v for k, v in entry.items() if k not in ('plan', 'point')},
                ))

        banner_data = banner_source.get('data', {})
        for slot in ('1_BANNER_MAIN_TOP_PC', '1_BANNER_MAIN_TOP_MO', '1_BANNER_HIGHLIGHT_BAR_PC'):
            for order, item in enumerate(banner_data.get(slot, [])):
                session.add(Banner(slot=slot, sort_order=order, raw_data=item))

        for order, item in enumerate(belt_source.get('data', {}).get('1_DISPLAY_MAIN_TOP_BELT', [])):
            session.add(TopBelt(sort_order=order, raw_data=item))

        session.commit()
        print(f'Seeded {len(products_by_id)} products, {len(main_categories)} categories and '
              f'{sum(len(plan_groups.get(k, [])) for k in ("1_PLAN_0", "1_PLAN_1"))} plans.')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Load bundled source JSON into PostgreSQL.')
    parser.add_argument('--reset', action='store_true', help='delete existing seed tables before loading')
    seed(parser.parse_args().reset)
