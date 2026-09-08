import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PlanSection from './PlanSection';
import FromMuji from './FromMuji';
import { mainPlans, fromMujiPlans, getProductById } from '../db/data';

jest.mock('react-router-dom', () => jest.requireActual('react-router'));
beforeEach(() => {
  window.IntersectionObserver = jest.fn(() => ({ observe: jest.fn(), disconnect: jest.fn() }));
});

it('renders both promotion groups with JSON products linked to existing detail data', () => {
  render(<MemoryRouter><PlanSection /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: mainPlans[5].plan.name })).toBeInTheDocument();
  for (const entry of mainPlans.filter((_, index) => index % 5 !== 0)) {
    expect(screen.getByRole('heading', { name: entry.plan.name })).toBeInTheDocument();
    for (const product of entry.point.flatMap(point => point.products)) {
      expect(getProductById(product.product_id)).not.toBeNull();
      expect(screen.getByRole('link', { name: new RegExp(product.product_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })).toHaveAttribute('href', `/products/view/${product.product_id}`);
    }
  }
});

it('opens hotspot products by tap or keyboard and closes with Escape or outside interaction', () => {
  render(<MemoryRouter><PlanSection /></MemoryRouter>);
  const product = mainPlans[0].point[0].products[0];
  const button = screen.getAllByRole('button', { name: `${product.product_name} 상품 정보` })[0];
  fireEvent.click(button);
  expect(button).toHaveAttribute('aria-expanded', 'true');
  expect(within(screen.getByRole('region', { name: '대표 상품' })).getByRole('link')).toHaveAttribute('href', `/products/view/${product.product_id}`);
  fireEvent.keyDown(button, { key: 'Escape' });
  expect(button).toHaveFocus();
  expect(screen.queryByRole('region', { name: '대표 상품' })).not.toBeInTheDocument();
  fireEvent.click(button);
  fireEvent.pointerDown(document.body);
  expect(button).toHaveAttribute('aria-expanded', 'false');
});

it('renders all nine From MUJI stories with placeholder links', () => {
  render(<MemoryRouter><FromMuji /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: 'From MUJI' })).toBeInTheDocument();
  for (const { plan } of fromMujiPlans) {
    expect(screen.getByRole('link', { name: plan.name, exact: true })).toHaveAttribute('href', '#');
  }
  expect(screen.getByRole('link', { name: 'From MUJI 더보기' })).toHaveAttribute('href', '#');
});
