'use strict';

// make the slider
class Mix_Slider {
  constructor(dif) {
    this.dif = Object.assign({}, dif);
  }

  initDots() {
    let _ = this.dif,
      $_ = this;
    for (let i = 0; i < _.totalSlides; i++) {
      let dot = document.createElement('li');
      dot.setAttribute('data-slide', i + 1);
      dot.setAttribute('class', 'slider__dot');
      _.dotsWrap.appendChild(dot);
    }
    _.dotsWrap.querySelectorAll('.slider__dot')[0].classList.add('slider__dot_active');
    _.dotsWrap.addEventListener('click', (e) => {
      if (e.target && e.target.nodeName == 'LI') {
        _.curSlide = e.target.getAttribute('data-slide');
        $_.setTransition(true);
        $_.goToSlide();
      }
    }, false);
  }

  setDot() {
    let _ = this.dif;
    _.dotsWrap.querySelector('.slider__dot_active').classList.remove('slider__dot_active');
    let dotNumber = _.curSlide;
    if (_.curSlide === 0) dotNumber = _.totalSlides - 1;
    else if (_.curSlide === _.totalSlides + 1) dotNumber = 1;
    let newDot = _.dotsWrap.querySelector(`[data-slide='${dotNumber}']`);
    newDot.classList.add('slider__dot_active');
  }

  initArrows() {
    let _ = this.dif,
      $_ = this;
    if (_.arrowL) {
      _.arrowL.addEventListener('click', (e) => {
        e.preventDefault();
        if (_.curSlide <= 0) return;
        _.curSlide--;
        $_.setTransition(true);
        $_.goToSlide();
      });
    }

    if (_.arrowR) {
      _.arrowR.addEventListener('click', (e) => {
        e.preventDefault();
        if (_.curSlide >= _.totalSlides + 1) return;

        _.curSlide++;
        $_.setTransition(true);
        $_.goToSlide();
      });
    }
  }

  setTransition(animateTranstion) {
    let _ = this.dif,
      animateValue = animateTranstion ? `all ${_.speed}ms ${_.easing}` : 'none';
    _.targetInner.style.transition = animateValue;
  }

  setCurSlide() {
    let _ = this.dif;
    _.targetInner.querySelector('.slider__item_cur').classList.remove('slider__item_cur');
    let current = _.targetSlides[_.curSlide].querySelector('img');
    current.classList.add('slider__item_cur');
    setUsedTools(current.getAttribute('data-tools'), current.getAttribute('data-url'));
  }

  goToSlide() {
    let _ = this.dif,
      $_ = this;
    let moveleft = this.getCurLeft();
    _.targetInner.style.transform = `translate(${-moveleft}px)`;
    $_.setDot();
    $_.setCurSlide();
  }



  getCurLeft() {
    let _ = this.dif;
    return _.moveLeft = _.targetSlides[_.curSlide].offsetLeft;
  }

  init() {
    let _ = this.dif,
      $_ = this;
    _.curSlide = 1;
    _.targetSlides = _.targetInner.querySelectorAll('.slider__item');
    _.targetSlides[_.curSlide].classList.add('slider__item_cur');
    _.totalSlides = _.targetSlides.length;
    _.lastClone = _.targetSlides[_.totalSlides - 1].cloneNode(true);
    _.lastClone.id = 'lastClone';
    _.firstClone = _.targetSlides[0].cloneNode(true);
    _.firstClone.id = 'firstClone';

    _.targetInner.insertBefore(_.lastClone, _.targetSlides[0]);
    _.targetInner.appendChild(_.firstClone);
    _.targetSlides = _.targetInner.querySelectorAll('.slider__item');
    _.moveLeft = _.targetSlides[_.curSlide].offsetLeft;

    $_.initArrows();
    $_.initDots();
    $_.setDot();
    $_.setCurSlide();

    for (let i = 0; i < _.totalSlides + 2; i++) {
      _.targetSlides[i].style.left = `${i - 1}00%`;
    }

    function transtionEndAfter() {

      switch (_.curSlide) {
        case _.totalSlides + 1:
          $_.setTransition(false);
          _.curSlide = 1;
          $_.goToSlide();
          break;
        case 0:
          $_.setTransition(false);
          _.curSlide = _.totalSlides;
          $_.goToSlide();
          break;
      }
    }

    _.targetInner.addEventListener('transitionend', transtionEndAfter);

    function addListenerMulti(el, s, fn) {
      s.split(' ').forEach((e) => el.addEventListener(e, fn, false));
    }

    function removeListenerMulti(el, s, fn) {
      s.split(' ').forEach((e) => el.removeEventListener(e, fn, false));
    }
    if (_.swipe) {
      addListenerMulti(_.targetInner, 'mousedown touchstart', startSwip);
    }
    _.isAnimating = false;
    _.isDown = false;


    function startSwip(e) {
      _.isDown = true;
      let touch = e;
      if (!_.isAnimating) {
        if (e.type == 'touchstart') {
          touch = e.targetTouches[0] || e.changesTouches[0];
        }

        _.startX = touch.pageX - _.moveLeft;
        addListenerMulti(_.targetInner, 'mousemove touchmove', swipMove);
        addListenerMulti(document.body, 'mouseup mouseleave touchend', swipEnd);
      }
    }

    function swipMove(e) {
      if (!_.isDown) return;
      let touch = e;
      if (e.type == 'touchmove') {
        touch = e.targetTouches[0] || e.changesTouches[0];
      }

      _.moveX = touch.pageX - _.moveLeft;
      /* if (Math.abs(_.moveX - _.startX) < 100) return; */
      _.isAnimating = true;
      _.target.classList.add('slider__is-animating');
      e.preventDefault();
      _.walk = _.moveX - _.startX;
      _.targetInner.style.transform = `translate(${-(_.moveLeft - _.walk)}px)`;
    }

    function swipEnd(e) {
      _.isDown = false;
      _.stayCur = Math.abs(_.walk) < 40 || typeof _.moveX === 'undefined' ? true : false;
      _.dir = _.walk < 0 ? 'left' : 'right';
      if (!_.stayCur) {
        _.dir === 'left' ? _.curSlide++ : _.curSlide--;
        $_.setTransition(true);
        _.targetInner.addEventListener('transitionend', transtionEndAfter);
      }
      $_.goToSlide();

      delete _.startX;
      delete _.moveX;
      delete _.x;
      delete _.walk;
      delete _.dir;
      delete _.stayCur;
      _.isAnimating = false;
      removeListenerMulti(_.targetInner, 'mousemove touchmove', swipMove);
      removeListenerMulti(document.body, 'mouseup mouseleave touchend', swipEnd);
    }
  }
}

let dif = {
  target: document.querySelector('.slider'),
  targetInner: document.querySelector('.slider__inner'),
  arrowL: document.querySelector('.slider__prevBtn'),
  arrowR: document.querySelector('.slider__nextBtn'),
  dotsWrap: document.querySelector('.slider__dotWrap'),
  speed: 600,
  easing: 'cubic-bezier(0.77, 0, 0.175, 1)',
  swipe: true
},
  toolsList = document.querySelectorAll('.desc__tool-item');

function setUsedTools(tools, url) {
  tools = tools.split(',');
  toolsList.forEach(item => {
    let toolName = item.getAttribute('data-toolName');
    if (tools.includes(toolName)) {
      item.classList.add('desc__tool-item_highlight');
    } else {
      item.classList.remove('desc__tool-item_highlight');
    }
  });

  const liveLink = document.querySelector('.js_live-view');
  liveLink.href = url;
}

function setsliderItem(src, tools, url) {
  const imageItem = document.createElement('img');
  imageItem.setAttribute('class', 'slider__img');
  imageItem.setAttribute('src', src);
  imageItem.setAttribute('data-tools', tools);
  imageItem.setAttribute('data-url', url);
  const sliderItem = document.createElement('div');
  sliderItem.setAttribute('class', 'slider__item');
  sliderItem.appendChild(imageItem);
  return sliderItem;
}

async function getSliderImages() {
  let projectsObj = await fetch('./data.json');
  projectsObj = await projectsObj.json();
  for (let item in projectsObj) {
    if (projectsObj.hasOwnProperty(item)) {
      const src = projectsObj[item].src,
        tools = projectsObj[item].tools,
        url = projectsObj[item].url,
        sliderItem = setsliderItem(src, tools, url);
      dif.targetInner.appendChild(sliderItem);
    }
  }

  let Slider = new Mix_Slider(dif);
  Slider.init();
}
getSliderImages();
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

// adjust the height of the slider to the height of the images
window.addEventListener('load', () => {
  window.addEventListener('resize', () => {
    const portfolioSlider = document.querySelector('.portfolio__slider');
    const portfolioImage = portfolioSlider.querySelector('.slider__img');
    portfolioSlider.style.height = `${portfolioImage.offsetHeight}px`;

  });
});



// // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
// deal with the menu and the nav for it
const menu = document.querySelector('.menu'),
  nav = document.querySelector('.nav'),
  navItem = nav.querySelectorAll('.nav__item');

function openMenu() {
  menu.classList.toggle('menu_open');
  nav.classList.toggle('nav_open');
}

function goToSection() {
  const prevSelected = nav.querySelector('.nav__item_selected');
  prevSelected.classList.remove('nav__item_selected');
  this.classList.add('nav__item_selected');
  openMenu();

}
menu.addEventListener('click', openMenu);
navItem.forEach(item => item.addEventListener('click', goToSection));
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

function debounce(func, wait = 20, immediate = true) {
  var timeout;
  return function () {
    var context = this, args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}
const easeInCubic = (t) => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
function scrollToElem(stamp, start, duration, scrollElemTop, startScrollOfset) {
  const runtime = stamp - start;
  let progress = runtime / duration;
  const ease = easeInCubic(progress);

  progress = Math.min(progress, 1);
  window.scrollTo(0, startScrollOfset + (scrollElemTop * ease));
  if (runtime < duration) {
    requestAnimationFrame((timestamp) => {
      const stamp = new Date().getTime();
      scrollToElem(stamp, start, duration, scrollElemTop, startScrollOfset);
    })
  }
}
const inputForm = document.querySelectorAll('.form__input');


function scrollToAnim() {
  const scrollElem = this;
  const anim = requestAnimationFrame((timestamp) => {
    const stamp = new Date().getTime(),
      duration = 1200,
      start = stamp,
      startScrollOfset = window.scrollY;
    const scrollElemTop = scrollElem.offsetTop;
    scrollToElem(stamp, start, duration, scrollElemTop, startScrollOfset);
  })
}
inputForm.forEach(input => {
  input.addEventListener('focus', () => {
    input.addEventListener('transitionend', scrollToAnim);
  });
});

/* const path = document.querySelector('path#sec-1');
console.log(path.getTotalLength()); */
const username = document.querySelector('.form__input[name="user"]');
console.log(username.value);
const sendBtn = document.querySelector('.form__btn');
sendBtn.addEventListener('click', () => {
  alert(`Can't receive your message ${username.value} now...
  thanks for understanding :)`);
  username.value = "";
})