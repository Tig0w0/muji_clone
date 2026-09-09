import React from 'react';
import { Link } from 'react-router-dom';
import { asset } from '../utils/asset';

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1000] flex h-[60px] w-full items-center justify-around border-t border-neutral-200 bg-white lg:hidden">
      <button type="button" className="flex h-full w-full flex-col items-center justify-center gap-1">
        <img src={asset('/images/icons/menu.svg')} alt="메뉴" className="h-6 w-6" />
      </button>
      <button type="button" className="flex h-full w-full flex-col items-center justify-center gap-1">
        <img src={asset('/images/icons/barcode.svg')} alt="바코드" className="h-6 w-6" />
      </button>
      <Link to="/" className="flex h-full w-full flex-col items-center justify-center gap-1">
        <img src={asset('/images/icons/home.svg')} alt="홈" className="h-6 w-6" />
      </Link>
      <button type="button" className="flex h-full w-full flex-col items-center justify-center gap-1">
        <img src={asset('/images/icons/heart.svg')} alt="찜" className="h-6 w-6" />
      </button>
      <Link to="/" className="flex h-full w-full flex-col items-center justify-center gap-1">
        <img src={asset('/images/icons/icon_user.svg')} alt="마이페이지" className="h-6 w-6" />
      </Link>
    </nav>
  );
};

export default BottomNav;
