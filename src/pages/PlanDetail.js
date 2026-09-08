import React, { useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPlanDetail } from '../db/data';
import './PlanDetail.css';

/* 날짜 포맷 헬퍼: "2026-07-27 00:00:00" → "2026. 07. 27" */
const formatDate = (str) => {
  if (!str) return '';
  const [date] = str.split(' ');
  const [y, m, d] = date.split('-');
  return `${y}. ${m}. ${d}`;
};

/* ── pc_content HTML이 없는 기획전의 기본 레이아웃 ─── */
const DefaultPlanLayout = ({ entry }) => {
  const { plan } = entry;
  return (
    <div className="plan-wrapper">
      <div className="fm_bn">
        <div className="bn_text">
          <div className="sub"><div>{plan.name}</div></div>
          <div className="title">{plan.title || plan.name}</div>
          {plan.sub_name && <div className="sub">{plan.sub_name}</div>}
          <div className="date">
            <div>게시일: {formatDate(plan.created_at)}</div>
          </div>
        </div>
        {plan.plan_thumbnail_image_full && (
          <div className="bn_img">
            <div><img src={plan.plan_thumbnail_image_full} alt={plan.name} /></div>
          </div>
        )}
      </div>

      {/* 연관 상품 포인트 */}
      {entry.point?.length > 0 && (
        <div className="fm_con_wrap">
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#888', fontSize: '14px' }}>
            이 기획전의 상세 콘텐츠는 준비 중입니다.
          </div>
        </div>
      )}
    </div>
  );
};

/* ── 인천상회편(ID:392) 하드코딩 레이아웃 (pc_content null) ─── */
const MarketPlanLayout = () => (
  <div className="plan-wrapper">
    <div className="fm_bn">
      <div className="bn_text">
        <div className="sub"><div>연결되는 시장</div></div>
        <div className="title">
          제142회 <br />
          연결되는 시장<br />
          인천상회편
        </div>
        <div className="date">
          <div>게시일: 2026. 08. 06</div>
        </div>
      </div>
      <div className="bn_img">
        <div><img src="/images/plans/2608_market_main.jpg" alt="" /></div>
      </div>
    </div>

    <div className="fm_con_wrap">
      <div className="market">
        <div className="mk_logo"><img src="/images/plans/community_market_logo.png" alt="" /></div>
        <div className="mk_title">
          <div>[제142회]</div>
          <div>연결되는 시장 인천상회편</div>
        </div>
        <div className="mk_info">
          <div><div>일시</div><div></div><div>2026. 7. 11 (토) - 7. 12 (일)</div></div>
          <div><div>시간</div><div></div><div>12:00 - 19:00</div></div>
          <div><div>장소</div><div></div><div>타임스퀘어점 2층 무인양품</div></div>
        </div>
      </div>

      <div className="img">
        <img src="/images/plans/2608_market_img.jpg" alt="" />
        <img src="/images/plans/2608_market_img1.jpg" alt="" />
      </div>

      <div className="text">
        <span>인천</span>은 항구의 활기와 개항장의 역사, 산업도시의 에너지, 그리고 새로운 도시의 감각이 공존하는 곳입니다.
        무인양품 타임스퀘어점에서 열린 지난 연결되는 시장 인천상회편에서 인천의 매력과 이야기, 오늘날의 생활 문화를 소개했습니다.
      </div>

      <div className="img">
        <img src="/images/plans/2608_market_img12.jpg" alt="" />
        <img src="/images/plans/2608_market_img3.jpg" alt="" />
      </div>

      <div className="text">
        연결되는 시장이 열리는 토요일 아침, 인천의 가게들이 이른 시간부터 매대를 꾸미고 손님을 맞을 채비를 시작했습니다.
        12시가 되자, 곳곳에서 상품의 이야기를 소개하는 출점자들의 목소리가 이어졌고, 다양한 시식과 시음, 볼거리가 더해지며 연결되는 시장은 금세 북적였습니다.
      </div>

      <div className="img">
        <img src="/images/plans/2608_market_img4.jpg" alt="" />
        <img src="/images/plans/2608_market_img5.jpg" alt="" />
        <img src="/images/plans/2608_market_img6.jpg" alt="" />
        <img src="/images/plans/2608_market_img7.jpg" alt="" />
        <img src="/images/plans/2608_market_img8.jpg" alt="" />
      </div>

      <div className="text">
        짜장면 밀키트, 인절미, 쭈꾸미와 감자칩, 순무 김치 등 지역의 먹거리를 선보였고, 지역의 이야기를 소개하는 미니어처 소품과 드립백도 소개되었습니다.
        인천의 사이다를 현대적으로 재해석한 프리미엄 소다와 현대인의 몸에 꼭 맞춘 차도 만나볼 수 있었습니다. 인천관광공사가 준비한 뽑기 이벤트도 현장에서 큰 인기를 끌었습니다.
      </div>

      <div className="img">
        <img src="/images/plans/2608_market_img9.jpg" alt="" />
        <img src="/images/plans/2608_market_img10.jpg" alt="" />
        <img src="/images/plans/2608_market_img11.jpg" alt="" />
      </div>

      <div className="text">
        이틀 동안 열린 <span>「연결되는 시장 : 인천상회편」</span>은 인천의 다양한 맛과 이야기로 사람과 사람이 연결되는 시간이었습니다.
        멀게만 느껴지던 지역도 그곳의 음식과 물건 그리고 이를 만드는 사람들의 이야기를 통해 한층 가까워집니다.
        이번 연결되는 시장에서 시작된 만남들이 인천이라는 지역을 새롭게 발견하는 계기가 되어, 또 다시 이어지기를 바랍니다.
      </div>

      <div className="text">
        <div>참여 브랜드</div>
        개항로인절미 (인절미) / 금풍양조장 (전통주) / 송쭈집 (쭈꾸미 밀키트) / 송화칩스 (생 감자칩, 고구마칩)
        연경 (짜장면 밀키트, 공갈빵) / 우리술상회 (전통주) / 인천 앞바다 첫 (사이다) / 차완 (블렌딩 티) /
        타베미니 (음식 미니어처 소품) / 포디움126 (인천기념품) / 핑크김치 (순무김치, 순무라페)
      </div>
    </div>

    <div className="credit_wrap">
      <div className="content_info">
        <div className="con_title">무인양품 연결되는 시장</div>
        <div>
          연결되는 시장은 지역의 생산자, 가게, 창작자들이 무인양품 매장에 모여 정기적으로 개최하는 작은 시장입니다.
          사람과 사람, 가게와 손님, 가게와 가게가 이어져 서로의 생각과 마음을 나누고자「연결되는 시장」이라고 이름 지었습니다.
        </div>
      </div>
      <div className="crd_text">
        <div>연결되는 시장 문의</div>
        <div></div>
        <div>무인양품 커뮤니티팀 (community@mujikorea.co.kr)</div>
      </div>
    </div>
  </div>
);

/* ── 메인 PlanDetail 컴포넌트 ─────────────────────── */
const PlanDetail = () => {
  const { id } = useParams();
  const entry = useMemo(() => getPlanDetail(id), [id]);

  /* 페이지 이동 시 맨 위로 스크롤 */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  /* 데이터를 찾을 수 없는 경우 */
  if (!entry) {
    return (
      <main className="px-4 py-24 text-center">
        <h1 className="text-xl font-semibold">기획전을 찾을 수 없습니다.</h1>
        <Link className="mt-6 inline-block underline" to="/">메인으로 돌아가기</Link>
      </main>
    );
  }

  const { plan } = entry;

  /* pc_content HTML이 있으면 그대로 렌더링 */
  if (plan.pc_content) {
    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: plan.pc_content }} />
      </div>
    );
  }

  /* 인천상회편(ID:392)처럼 특수 레이아웃이 필요한 경우 */
  if (String(plan.plan_id) === '392') {
    return <MarketPlanLayout />;
  }

  /* 그 외: 썸네일 + 기본 정보 레이아웃 */
  return <DefaultPlanLayout entry={entry} />;
};

export default PlanDetail;
