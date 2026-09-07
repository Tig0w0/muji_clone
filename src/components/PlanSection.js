import React, { useEffect, useRef } from 'react';

const PlanSection = () => {
  const sectionRef = useRef(null);
  const rightColumnRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !rightColumnRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.top <= windowHeight && rect.bottom >= 0) {
        // 화면 중앙(기준점) 대비 섹션의 위치를 계산하여 상하로만 살짝 움직이게 합니다.
        // rect.top이 windowHeight(화면 최하단 진입)일 때 양수(아래로 살짝 밀림)
        // 스크롤을 내려서 rect.top이 화면 상단으로 갈수록 음수(위로 당겨짐)
        const offset = (rect.top - (windowHeight / 2)) * 0.06; 
        
        rightColumnRef.current.style.transform = `translateY(${offset}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 진입 시 위치 계산
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="mt-[48px] flex w-full max-lg:flex-col lg:mt-[100px] lg:justify-between">
      <div className="relative top-0 max-lg:overflow-hidden lg:w-[60%] xl:w-[50%]">
        <div className="relative aspect-[360/405] w-full lg:sticky lg:left-0 lg:top-0 lg:h-[100vh]">
          <a href="/plan/view/388">
            <div className="relative left-0 right-0 block h-full w-full">
              <img src="https://public.mujikorea.co.kr/images/plans/o0LSY3rx1viM48B6uJKMSfl5NwcLSoafvCtHdn4g.jpg" alt="워싱 브로드 셔츠로 다양한 계절을 즐겨보세요." className="absolute left-0 right-0 h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-10 left-4 z-[1] text-neutral-white lg:bottom-[100px] lg:left-[60px] 3xl:bottom-[180px] 3xl:left-[100px]">
              <p className="font-medium lg:text-2xl">워싱 브로드 셔츠로 다양한 계절을 즐겨보세요.</p>
              <p className="mt-3 whitespace-pre-line text-[28px] font-bold leading-tight lg:mt-5 lg:text-[52px]">닿는 순간 부드러운, 데일리 셔츠</p>
            </div>
          </a>
          <ul>
            <li style={{top: 'calc(39.1132% - 8px)', left: '25.388%'}} className="absolute flex pt-2 group">
              <i className="lg:cursor-default relative flex h-[24px] w-[24px] items-center justify-center rounded-full bg-black/40 ring-[1.5px] ring-white/50 backdrop-blur-sm transition-all hover:bg-black/60"><span className="h-[8px] w-[8px] rounded-full bg-white"></span></i>
              <div className="absolute translate-y-[calc(-100%-8px)] left-0 z-[2] hidden w-[164px] border border-neutral-200 bg-neutral-white p-3 lg:px-3 lg:py-4 group-hover:block lg:group-hover:block">
                <p className="text-[13px] leading-[13px] text-[#1d1d1f]">워싱 브로드 레귤러 칼라 긴소매 셔츠</p>
                <div className="mt-3 text-[13px] font-semibold leading-[13px]">29,900원</div>
                <a className="inline-flex items-center justify-center font-medium gap-[2px] w-full h-[28px] px-[8px] false text-[11px] text-[#9D9DA0] tracking-[-0.02rem] break-keep rounded-md border border-solid border-[#c4c4c6] border-[0.5px] false mt-3" href="/products/view/1005557">
                  <span className="text-[#9D9DA0] font-medium">상품 보러가기</span>
                  <i className="inline-block cursor-pointer align-top w-6 w-[14px]">
                    <img alt="" loading="lazy" width="24" height="24" decoding="async" className="h-full w-full" style={{color: 'transparent'}} src="https://mujikorea.co.kr/_next/static/media/arrow_right_g.00gqkt3rc96uw.svg" />
                  </i>
                </a>
              </div>
            </li>
            <li style={{top: 'calc(30.5492% - 8px)', left: '39.4391%'}} className="absolute flex pt-2 group">
              <i className="lg:cursor-default relative flex h-[24px] w-[24px] items-center justify-center rounded-full bg-black/40 ring-[1.5px] ring-white/50 backdrop-blur-sm transition-all hover:bg-black/60"><span className="h-[8px] w-[8px] rounded-full bg-white"></span></i>
              <div className="absolute translate-y-[calc(-100%-8px)] left-0 z-[2] hidden w-[164px] border border-neutral-200 bg-neutral-white p-3 lg:px-3 lg:py-4 group-hover:block lg:group-hover:block">
                <p className="text-[13px] leading-[13px] text-[#1d1d1f]">워싱 브로드 레귤러 칼라 긴소매 셔츠</p>
                <div className="mt-3 text-[13px] font-semibold leading-[13px]">29,900원</div>
                <a className="inline-flex items-center justify-center font-medium gap-[2px] w-full h-[28px] px-[8px] false text-[11px] text-[#9D9DA0] tracking-[-0.02rem] break-keep rounded-md border border-solid border-[#c4c4c6] border-[0.5px] false mt-3" href="/products/view/1005389">
                  <span className="text-[#9D9DA0] font-medium">상품 보러가기</span>
                  <i className="inline-block cursor-pointer align-top w-6 w-[14px]">
                    <img alt="" loading="lazy" width="24" height="24" decoding="async" className="h-full w-full" style={{color: 'transparent'}} src="https://mujikorea.co.kr/_next/static/media/arrow_right_g.00gqkt3rc96uw.svg" />
                  </i>
                </a>
              </div>
            </li>
            <li style={{top: 'calc(52.4066% - 8px)', left: '83.6685%'}} className="absolute flex pt-2 group">
              <i className="lg:cursor-default relative flex h-[24px] w-[24px] items-center justify-center rounded-full bg-black/40 ring-[1.5px] ring-white/50 backdrop-blur-sm transition-all hover:bg-black/60"><span className="h-[8px] w-[8px] rounded-full bg-white"></span></i>
              <div className="absolute translate-y-[calc(-100%-8px)] right-0 z-[2] hidden w-[164px] border border-neutral-200 bg-neutral-white p-3 lg:px-3 lg:py-4 group-hover:block lg:group-hover:block">
                <p className="text-[13px] leading-[13px] text-[#1d1d1f]">슬러브 치노 와이드 팬츠</p>
                <div className="mt-3 text-[13px] font-semibold leading-[13px]">49,900원</div>
                <a className="inline-flex items-center justify-center font-medium gap-[2px] w-full h-[28px] px-[8px] false text-[11px] text-[#9D9DA0] tracking-[-0.02rem] break-keep rounded-md border border-solid border-[#c4c4c6] border-[0.5px] false mt-3" href="/products/view/1005367">
                  <span className="text-[#9D9DA0] font-medium">상품 보러가기</span>
                  <i className="inline-block cursor-pointer align-top w-6 w-[14px]">
                    <img alt="" loading="lazy" width="24" height="24" decoding="async" className="h-full w-full" style={{color: 'transparent'}} src="https://mujikorea.co.kr/_next/static/media/arrow_right_g.00gqkt3rc96uw.svg" />
                  </i>
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex gap-[34px] bg-primary-beige_100 px-4 py-11 max-xl:flex-col lg:w-[40%] lg:px-6 xl:w-[50%] xl:flex-wrap xl:gap-6 xl:py-[60px]">
        <div className="xl:w-[calc(50%-12px)] [&>article:nth-child(2n)]:mt-[34px] [&>article:nth-child(2n)]:lg:mt-[40px] [&>article:nth-child(2n)]:xl:mt-[80px]">
          <article className="flex-1 bg-neutral-white">
            <a href="/plan/view/370">
              <div className="relative aspect-[328/369] lg:aspect-[444/500]">
                <img src="https://public.mujikorea.co.kr/images/plans/6cZLi0kxSEs8vLVQjY5kQvL9EDtceO3CcHri2DFr.jpg" alt="에이징 탄력케어" className="absolute left-0 right-0 h-full w-full object-cover" />
              </div>
              <div className="px-4 pt-6 lg:pt-5 xl:px-5 xl:pt-6">
                <dl>
                  <dt className="break-words break-keep text-lg font-semibold lg:text-xl xl:text-2xl">누구나 쉽게 시작하는 탄력 케어</dt>
                  <dd className="mt-2 whitespace-pre-line break-words break-keep text-neutral-700 max-xl:text-sm lg:mt-3 xl:mt-5">첫 단계부터 마무리 보습까지 사용 단계에 맞춰 선택하는 에이징 탄력케어</dd>
                </dl>
              </div>
            </a>
            <div className="px-4 pb-6 lg:pb-8 xl:px-5 xl:pb-8">
              <div className="mt-[20px] grid gap-2 lg:mt-[24px] lg:grid-cols-3 xl:mt-[24px]">
                <article className="flex cursor-pointer gap-[18px] lg:flex-col lg:gap-2">
                  <div className="flex flex-col lg:flex-row">
                    <div className="relative flex aspect-square w-[80px] justify-end gap-[4px] lg:w-full">
                      <img className="h-full w-full bg-neutral-200 object-cover" src="https://product.mujikorea.co.kr/images/products/4550583451141/4550583451141_1260.jpg?w=300" alt="에이징 케어 스킨" />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="mb-2 line-clamp-2 text-[13px] leading-[14px] lg:h-[28px] xl:text-[13px]">에이징 케어 스킨</p>
                    <p className="flex items-center text-[13px] font-semibold leading-[13px]">22,900원</p>
                  </div>
                </article>
                <article className="flex cursor-pointer gap-[18px] lg:flex-col lg:gap-2">
                  <div className="flex flex-col lg:flex-row">
                    <div className="relative flex aspect-square w-[80px] justify-end gap-[4px] lg:w-full">
                      <img className="h-full w-full bg-neutral-200 object-cover" src="https://product.mujikorea.co.kr/images/products/4550583451158/4550583451158_1260.jpg?w=300" alt="에이징 케어 로션" />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="mb-2 line-clamp-2 text-[13px] leading-[14px] lg:h-[28px] xl:text-[13px]">에이징 케어 로션</p>
                    <p className="flex items-center text-[13px] font-semibold leading-[13px]">22,900원</p>
                  </div>
                </article>
                <article className="flex cursor-pointer gap-[18px] lg:flex-col lg:gap-2">
                  <div className="flex flex-col lg:flex-row">
                    <div className="relative flex aspect-square w-[80px] justify-end gap-[4px] lg:w-full">
                      <img className="h-full w-full bg-neutral-200 object-cover" src="https://product.mujikorea.co.kr/images/products/4550583451165/4550583451165_1260.jpg?w=300" alt="에이징 케어 크림" />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="mb-2 line-clamp-2 text-[13px] leading-[14px] lg:h-[28px] xl:text-[13px]">에이징 케어 크림</p>
                    <p className="flex items-center text-[13px] font-semibold leading-[13px]">22,900원</p>
                  </div>
                </article>
              </div>
            </div>
          </article>
          <article className="flex-1 bg-neutral-white">
            <a href="/plan/view/223">
              <div className="relative aspect-[328/369] lg:aspect-[444/500]">
                <img src="https://public.mujikorea.co.kr/images/plans/ILzSAxiBWePSN5rqr35RGINAZsQYH6w1Ll5dtYh2.png" alt="MUJI 365" className="absolute left-0 right-0 h-full w-full object-cover" />
              </div>
              <div className="px-4 pt-6 lg:pt-5 xl:px-5 xl:pt-6">
                <dl>
                  <dt className="break-words break-keep text-lg font-semibold lg:text-xl xl:text-2xl">MUJI 365</dt>
                  <dd className="mt-2 whitespace-pre-line break-words break-keep text-neutral-700 max-xl:text-sm lg:mt-3 xl:mt-5">하루에 하나씩 넘기는 일력처럼, 매일 하나씩 일상 속에 스며있는 무인양품의 물건들을 전해드립니다.</dd>
                </dl>
              </div>
            </a>
            <div className="px-4 pb-6 lg:pb-8 xl:px-5 xl:pb-8">
              <div className="mt-[20px] grid gap-2 lg:mt-[24px] lg:grid-cols-3 xl:mt-[24px]">
                <article className="flex cursor-pointer gap-[18px] lg:flex-col lg:gap-2">
                  <div className="flex flex-col lg:flex-row">
                    <div className="relative flex aspect-square w-[80px] justify-end gap-[4px] lg:w-full">
                      <img className="h-full w-full bg-neutral-200 object-cover" src="https://product.mujikorea.co.kr/images/products/4550723412728/4550723412728_1260.jpg?w=300" alt="키즈 탱크톱" />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="mb-2 line-clamp-2 text-[13px] leading-[14px] lg:h-[28px] xl:text-[13px]">키즈 후라이스 탱크톱</p>
                    <p className="flex items-center text-[13px] font-semibold leading-[13px]">7,900원</p>
                  </div>
                </article>
                <article className="flex cursor-pointer gap-[18px] lg:flex-col lg:gap-2">
                  <div className="flex flex-col lg:flex-row">
                    <div className="relative flex aspect-square w-[80px] justify-end gap-[4px] lg:w-full">
                      <img className="h-full w-full bg-neutral-200 object-cover" src="https://product.mujikorea.co.kr/images/products/4550583451158/4550583451158_1260.jpg?w=300" alt="에이징 케어 로션" />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="mb-2 line-clamp-2 text-[13px] leading-[14px] lg:h-[28px] xl:text-[13px]">에이징 케어 로션</p>
                    <p className="flex items-center text-[13px] font-semibold leading-[13px]">22,900원</p>
                  </div>
                </article>
                <article className="flex cursor-pointer gap-[18px] lg:flex-col lg:gap-2">
                  <div className="flex flex-col lg:flex-row">
                    <div className="relative flex aspect-square w-[80px] justify-end gap-[4px] lg:w-full">
                      <img className="h-full w-full bg-neutral-200 object-cover" src="https://product.mujikorea.co.kr/images/products/4550583767150/4550583767150_1260.jpg?w=300" alt="스틸 칸막이" />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="mb-2 line-clamp-2 text-[13px] leading-[14px] lg:h-[28px] xl:text-[13px]">스틸 칸막이 스탠드 다크그레이</p>
                    <p className="flex items-center text-[13px] font-semibold leading-[13px]">24,900원</p>
                  </div>
                </article>
              </div>
            </div>
          </article>
        </div>

        <div ref={rightColumnRef} className="transition-transform duration-300 ease-out xl:w-[calc(50%-12px)]" style={{transform: 'translateY(0px)'}}>
          <div className="[&>article:nth-child(2n)]:mt-[34px] [&>article:nth-child(2n)]:xl:mt-[80px]">
            <article className="flex-1 bg-neutral-white">
              <a href="/plan/view/258">
                <div className="relative aspect-[328/369] lg:aspect-[444/500]">
                  <img src="https://public.mujikorea.co.kr/images/plans/c94mh5uEPfCL8EybJ1XievbsC0RuLsNiFtVZbk8H.jpg" alt="26AW" className="absolute left-0 right-0 h-full w-full object-cover" />
                </div>
                <div className="px-4 pt-6 lg:pt-5 xl:px-5 xl:pt-6">
                  <dl>
                    <dt className="break-words break-keep text-lg font-semibold lg:text-xl xl:text-2xl">26AW AUTUMN STYLING</dt>
                    <dd className="mt-2 whitespace-pre-line break-words break-keep text-neutral-700 max-xl:text-sm lg:mt-3 xl:mt-5">선선하지만 서늘하지 않고, 가볍지만 허전하지 않은 '기분 좋은 소재'를 제안합니다.</dd>
                  </dl>
                </div>
              </a>
              <div className="px-4 pb-6 lg:pb-8 xl:px-5 xl:pb-8">
                <div className="mt-[20px] grid gap-2 lg:mt-[24px] lg:grid-cols-3 xl:mt-[24px]">
                  <article className="flex cursor-pointer gap-[18px] lg:flex-col lg:gap-2">
                    <div className="flex flex-col lg:flex-row">
                      <div className="relative flex aspect-square w-[80px] justify-end gap-[4px] lg:w-full">
                        <img className="h-full w-full bg-neutral-200 object-cover" src="https://product.mujikorea.co.kr/images/products/1/497/TMFBL9S4ud9Y1bcm0wkPfiWbPmv7GKYw51ZP8XHx.jpg?w=300" alt="셔츠" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="mb-2 line-clamp-2 text-[13px] leading-[14px] lg:h-[28px] xl:text-[13px]">강연 코튼 시어 긴소매 셔츠</p>
                      <p className="flex items-center text-[13px] font-semibold leading-[13px]">49,900원</p>
                    </div>
                  </article>
                  <article className="flex cursor-pointer gap-[18px] lg:flex-col lg:gap-2">
                    <div className="flex flex-col lg:flex-row">
                      <div className="relative flex aspect-square w-[80px] justify-end gap-[4px] lg:w-full">
                        <img className="h-full w-full bg-neutral-200 object-cover" src="https://product.mujikorea.co.kr/images/products/4550723222457/4550723222457_1260.jpg?w=300" alt="티셔츠" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="mb-2 line-clamp-2 text-[13px] leading-[14px] lg:h-[28px] xl:text-[13px]">재생 소재로 만든 와플 크루넥 긴소매 티셔츠</p>
                      <p className="flex items-center text-[13px] font-semibold leading-[13px]">29,900원</p>
                    </div>
                  </article>
                  <article className="flex cursor-pointer gap-[18px] lg:flex-col lg:gap-2">
                    <div className="flex flex-col lg:flex-row">
                      <div className="relative flex aspect-square w-[80px] justify-end gap-[4px] lg:w-full">
                        <img className="h-full w-full bg-neutral-200 object-cover" src="https://product.mujikorea.co.kr/images/products/4550723460651/4550723460651_1260.jpg?w=300" alt="팬츠" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="mb-2 line-clamp-2 text-[13px] leading-[14px] lg:h-[28px] xl:text-[13px]">워싱 데님 이지 팬츠</p>
                      <p className="flex items-center text-[13px] font-semibold leading-[13px]">39,900원</p>
                    </div>
                  </article>
                </div>
              </div>
            </article>
            <article className="flex-1 bg-neutral-white">
              <a href="/plan/view/115">
                <div className="relative aspect-[328/369] lg:aspect-[444/500]">
                  <img src="https://public.mujikorea.co.kr/images/plans/cTjfjivXPeRvkWemXvCKZiMdFjf8VuUZ1au96CvF.jpg" alt="수납" className="absolute left-0 right-0 h-full w-full object-cover" />
                </div>
                <div className="px-4 pt-6 lg:pt-5 xl:px-5 xl:pt-6">
                  <dl>
                    <dt className="break-words break-keep text-lg font-semibold lg:text-xl xl:text-2xl">보이는 수납으로 일상을 더 편리하게</dt>
                    <dd className="mt-2 whitespace-pre-line break-words break-keep text-neutral-700 max-xl:text-sm lg:mt-3 xl:mt-5">투명한 소재로 공간이 더 넓고 깔끔해 보이며, 어느 공간에도 잘 녹아드는 아크릴 수납을 소개합니다.</dd>
                  </dl>
                </div>
              </a>
              <div className="px-4 pb-6 lg:pb-8 xl:px-5 xl:pb-8">
                <div className="mt-[20px] grid gap-2 lg:mt-[24px] lg:grid-cols-3 xl:mt-[24px]">
                  <article className="flex cursor-pointer gap-[18px] lg:flex-col lg:gap-2">
                    <div className="flex flex-col lg:flex-row">
                      <div className="relative flex aspect-square w-[80px] justify-end gap-[4px] lg:w-full">
                        <img className="h-full w-full bg-neutral-200 object-cover" src="https://product.mujikorea.co.kr/images/products/4934761798202/4934761798202_1260.jpg?w=300" alt="수납" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="mb-2 line-clamp-2 text-[13px] leading-[14px] lg:h-[28px] xl:text-[13px]">아크릴 소품 수납 박스ㆍ3단</p>
                      <p className="flex items-center text-[13px] font-semibold leading-[13px]">29,900원</p>
                    </div>
                  </article>
                  <article className="flex cursor-pointer gap-[18px] lg:flex-col lg:gap-2">
                    <div className="flex flex-col lg:flex-row">
                      <div className="relative flex aspect-square w-[80px] justify-end gap-[4px] lg:w-full">
                        <img className="h-full w-full bg-neutral-200 object-cover" src="https://product.mujikorea.co.kr/images/products/4945247380910/4945247380910_1260.jpg?w=300" alt="서랍" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="mb-2 line-clamp-2 text-[13px] leading-[14px] lg:h-[28px] xl:text-[13px]">아크릴 2단서랍</p>
                      <p className="flex items-center text-[13px] font-semibold leading-[13px]">24,900원</p>
                    </div>
                  </article>
                  <article className="flex cursor-pointer gap-[18px] lg:flex-col lg:gap-2">
                    <div className="flex flex-col lg:flex-row">
                      <div className="relative flex aspect-square w-[80px] justify-end gap-[4px] lg:w-full">
                        <img className="h-full w-full bg-neutral-200 object-cover" src="https://product.mujikorea.co.kr/images/products/4550344596524/4550344596524_1260.jpg?w=300" alt="파티션" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="mb-2 line-clamp-2 text-[13px] leading-[14px] lg:h-[28px] xl:text-[13px]">아크릴 케이스용 벨루어 파티션ㆍ세로</p>
                      <p className="flex items-center text-[13px] font-semibold leading-[13px]">5,900원</p>
                    </div>
                  </article>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanSection;
