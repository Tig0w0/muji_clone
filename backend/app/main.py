import os
from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from .database import get_session
from .models import Banner, Category, Plan, Product, ProductCategory, TopBelt

app = FastAPI(title='MUJI Clone API')
origin = os.getenv('FRONTEND_ORIGIN', 'http://localhost:3000')
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin],
    allow_credentials=True,
    allow_methods=['GET'],
    allow_headers=['*'],
)
SessionDep = Annotated[Session, Depends(get_session)]

@app.get('/health')
def health():
    return {'ok': True}


@app.get('/health/db')
def database_health(session: SessionDep):
    session.execute(text('SELECT 1'))
    return {'ok': True}

@app.get('/api/catalog/bootstrap')
def catalog_bootstrap(session: SessionDep):
    product_rows = session.scalars(select(Product)).all()
    products = {p.product_id: p.raw_data for p in product_rows}
    categories = session.scalars(select(Category).order_by(Category.sort_order)).all()
    links = session.execute(
        select(ProductCategory.category_id, ProductCategory.product_id, ProductCategory.sort_order)
        .order_by(ProductCategory.category_id, ProductCategory.sort_order)
    ).all()
    links_by_category = {}
    for category_id, product_id, sort_order in links:
        links_by_category.setdefault(category_id, []).append((sort_order, product_id))

    main_categories = {}
    for category in categories:
        ordered_ids = [pid for _, pid in links_by_category.get(category.id, [])]
        main_categories[category.key] = {
            **category.raw_data,
            'products': [products[pid] for pid in ordered_ids if pid in products],
        }

    banners = session.scalars(select(Banner).order_by(Banner.slot, Banner.sort_order)).all()
    banner_groups = {}
    for banner in banners:
        banner_groups.setdefault(banner.slot, []).append(banner.raw_data)

    plans = session.scalars(select(Plan).order_by(Plan.group_key, Plan.sort_order)).all()
    plan_groups = {}
    for plan in plans:
        plan_data = {**plan.raw_plan, 'pc_content': plan.pc_content}
        plan_groups.setdefault(plan.group_key, []).append({
            **plan.raw_entry,
            'plan': plan_data,
            'point': plan.point or [],
        })

    top_belts = session.scalars(select(TopBelt).order_by(TopBelt.sort_order)).all()

    return {
        'topBelt': [item.raw_data for item in top_belts],
        'mainBannersPC': banner_groups.get('1_BANNER_MAIN_TOP_PC', []),
        'mainBannersMO': banner_groups.get('1_BANNER_MAIN_TOP_MO', []),
        'highlightBanners': banner_groups.get('1_BANNER_HIGHLIGHT_BAR_PC', []),
        'mainCategoryProducts': main_categories,
        'mainPlans': plan_groups.get('1_PLAN_0', []),
        'fromMujiPlans': plan_groups.get('1_PLAN_1', []),
        'productDetailsList': [p.detail_data for p in product_rows if p.is_detail and p.detail_data],
    }
