const slider = document.getElementById('slider');
const pages = Array.from(document.querySelectorAll('.page'));
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageStatus = document.getElementById('pageStatus');
const dotsWrap = document.getElementById('pageDots');
const navButtons = Array.from(document.querySelectorAll('[data-slide]'));
const desktopMode = () => window.innerWidth > 820;
let currentIndex = 0;
let wheelLock = false;

const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting) entry.target.classList.add('visible');
  });
},{threshold:.16});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

function createDots(){
  dotsWrap.innerHTML='';
  pages.forEach((_, idx)=>{
    const dot = document.createElement('button');
    dot.type='button';
    dot.setAttribute('aria-label', `${idx + 1}번 페이지 이동`);
    dot.addEventListener('click', ()=>goToSlide(idx));
    dotsWrap.appendChild(dot);
  });
}

function updateUI(){
  pageStatus.textContent = `${String(currentIndex + 1).padStart(2,'0')} / ${String(pages.length).padStart(2,'0')}`;
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === pages.length - 1;

  Array.from(dotsWrap.children).forEach((dot, idx)=>{
    dot.classList.toggle('active', idx === currentIndex);
  });

  document.querySelectorAll('.nav-links button').forEach(btn=>btn.classList.remove('active'));
  navButtons.forEach(btn=>{
    const idx = Number(btn.dataset.slide);
    if(idx === currentIndex) btn.classList.add('active');
  });
}

function goToSlide(index){
  const targetIndex = Math.max(0, Math.min(index, pages.length - 1));
  currentIndex = targetIndex;
  pages[targetIndex].scrollIntoView({behavior:'smooth', inline:'start'});
  updateUI();
}

function getNearestPage(){
  if(!desktopMode()){
    const y = window.scrollY;
    let nearest = 0;
    let min = Infinity;
    pages.forEach((page, idx)=>{
      const diff = Math.abs(page.offsetTop - y);
      if(diff < min){ min = diff; nearest = idx; }
    });
    return nearest;
  }
  const x = slider.scrollLeft;
  const width = window.innerWidth;
  return Math.round(x / width);
}

function syncCurrentIndex(){
  currentIndex = getNearestPage();
  updateUI();
}

function handleWheel(e){
  if(!desktopMode() || wheelLock) return;
  if(Math.abs(e.deltaY) < 12 && Math.abs(e.deltaX) < 12) return;
  e.preventDefault();
  wheelLock = true;
  const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  if(delta > 0 && currentIndex < pages.length - 1) goToSlide(currentIndex + 1);
  else if(delta < 0 && currentIndex > 0) goToSlide(currentIndex - 1);
  setTimeout(()=>{ wheelLock = false; }, 650);
}

prevBtn.addEventListener('click', ()=>goToSlide(currentIndex - 1));
nextBtn.addEventListener('click', ()=>goToSlide(currentIndex + 1));

navButtons.forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    goToSlide(Number(btn.dataset.slide));
  });
});

document.addEventListener('keydown', (e)=>{
  if(modal.classList.contains('open')){
    if(e.key === 'Escape') closeModal();
    return;
  }

  if(!desktopMode()) return;
  if(e.key === 'ArrowRight') goToSlide(currentIndex + 1);
  if(e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
});

slider.addEventListener('scroll', ()=>{
  if(desktopMode()) syncCurrentIndex();
}, {passive:true});
window.addEventListener('scroll', ()=>{
  if(!desktopMode()) syncCurrentIndex();
}, {passive:true});
window.addEventListener('resize', ()=>{
  syncCurrentIndex();
});
window.addEventListener('wheel', handleWheel, {passive:false});

createDots();
updateUI();

const modal = document.getElementById('modal');
const mi = document.getElementById('modalImg');
const mt = document.getElementById('modalTitle');
const ms = document.getElementById('modalSub');

function openModal(target){
  const img = target.querySelector('img');
  if(!img) return;
  mi.src = img.src;
  mt.textContent = target.dataset.title || img.alt || 'Image Preview';
  ms.textContent = target.dataset.sub || '';
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}
function closeModal(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('.zoomable').forEach(el=>{
  el.addEventListener('click', ()=>openModal(el));
});

document.querySelector('.modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });
