import re
import sys

def html_to_jsx(html):
    # class -> className
    html = html.replace('class=', 'className=')
    # for -> htmlFor
    html = html.replace('for=', 'htmlFor=')
    # <!-- --> 제거
    html = re.sub(r'<!--[\s\S]*?-->', '', html)
    
    # img 태그 닫기
    html = re.sub(r'<(img|input|br|hr)([^>]*?)(?<!/)>', r'<\1\2 />', html)

    # style 속성 객체로 변환
    def style_replacer(match):
        style_str = match.group(1)
        styles = []
        for s in style_str.split(';'):
            s = s.strip()
            if not s: continue
            parts = s.split(':', 1)
            if len(parts) == 2:
                key, val = parts[0].strip(), parts[1].strip()
                # kebab-case to camelCase
                key = re.sub(r'-([a-z])', lambda x: x.group(1).upper(), key)
                styles.append(f"{key}: '{val}'")
        
        return "style={{" + ", ".join(styles) + "}}"

    html = re.sub(r'style="([^"]+)"', style_replacer, html)
    
    return html

with open('c:/react/muji/temp.txt', 'r', encoding='utf-8') as f:
    html_content = f.read()

jsx_content = html_to_jsx(html_content)

# TranslateInUpSection 에 ref 할당
jsx_content = jsx_content.replace(
    'className="TranslateInUpSection', 
    'ref={(el) => { if(el && !observerRef.current.includes(el)) observerRef.current.push(el); }} className="TranslateInUpSection'
)

# 첫번째 div (왼쪽 Sticky 배너)의 툴팁에 호버 이벤트 추가
# 원본 코드에는 [li:hover_>_&]:lg:block 같은 Tailwind 클래스가 있으므로 호버 처리가 CSS로 해결된다.
# 하지만 <i className="Dot hover:On lg:cursor-default"></i> 에 대해 추가 처리가 필요할 수 있다.

template = f"""import React, {{ useEffect, useRef }} from 'react';

const PlanSection = () => {{
  const observerRef = useRef([]);

  useEffect(() => {{
    const observer = new IntersectionObserver(
      (entries) => {{
        entries.forEach((entry) => {{
          if (entry.isIntersecting) {{
            entry.target.style.transform = 'translateY(0px)';
            entry.target.style.opacity = '1';
          }}
        }});
      }},
      {{ threshold: 0.1 }}
    );

    observerRef.current.forEach((el) => {{
      if (el) {{
        el.style.transform = 'translateY(50px)';
        el.style.opacity = '0';
        el.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        observer.observe(el);
      }}
    }});

    return () => observer.disconnect();
  }}, []);

  return (
    {jsx_content}
  );
}};

export default PlanSection;
"""

with open('c:/react/muji/muji-clone/src/components/PlanSection.js', 'w', encoding='utf-8') as f:
    f.write(template)

print("Conversion complete.")
