from sqlalchemy import BigInteger, Boolean, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base

class Product(Base):
    __tablename__ = 'products'
    product_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    product_name: Mapped[str] = mapped_column(String(255))
    code: Mapped[str | None] = mapped_column(String(100), nullable=True)
    sell_price: Mapped[int] = mapped_column(Integer, default=0)
    retail_price: Mapped[int] = mapped_column(Integer, default=0)
    sale_state: Mapped[str | None] = mapped_column(String(30), nullable=True)
    total_stock: Mapped[int] = mapped_column(Integer, default=0)
    shipping_type: Mapped[str | None] = mapped_column(String(30), nullable=True)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    review_score: Mapped[float] = mapped_column(Float, default=0)
    is_detail: Mapped[bool] = mapped_column(Boolean, default=False)
    raw_data: Mapped[dict] = mapped_column(JSON)
    detail_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

class Category(Base):
    __tablename__ = 'categories'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    key: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    sort_order: Mapped[int] = mapped_column(Integer)
    raw_data: Mapped[dict] = mapped_column(JSON)

class ProductCategory(Base):
    __tablename__ = 'product_categories'
    category_id: Mapped[int] = mapped_column(ForeignKey('categories.id', ondelete='CASCADE'), primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey('products.product_id', ondelete='CASCADE'), primary_key=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

class Plan(Base):
    __tablename__ = 'plans'
    plan_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    group_key: Mapped[str] = mapped_column(String(30), index=True)
    sort_order: Mapped[int] = mapped_column(Integer)
    name: Mapped[str] = mapped_column(String(255))
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sub_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_at: Mapped[str | None] = mapped_column(String(32), nullable=True)
    end_at: Mapped[str | None] = mapped_column(String(32), nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    pc_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_plan: Mapped[dict] = mapped_column(JSON)
    point: Mapped[list] = mapped_column(JSON)
    raw_entry: Mapped[dict] = mapped_column(JSON)

class Banner(Base):
    __tablename__ = 'banners'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    slot: Mapped[str] = mapped_column(String(80), index=True)
    sort_order: Mapped[int] = mapped_column(Integer)
    raw_data: Mapped[dict] = mapped_column(JSON)

class TopBelt(Base):
    __tablename__ = 'top_belts'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sort_order: Mapped[int] = mapped_column(Integer)
    raw_data: Mapped[dict] = mapped_column(JSON)
