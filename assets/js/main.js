/**
 * Portfolio – Enhanced main.js
 * Professional palette: steel blue accent
 */
!(function($) {
  "use strict";

  /* ============================================================
     PARTICLE CANVAS
     ============================================================ */
  function initParticles() {
    var header = document.getElementById('header');
    if (!header) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    header.insertBefore(canvas, header.firstChild);

    var ctx = canvas.getContext('2d');
    var W, H, particles = [];

    function resize() {
      W = canvas.width  = header.offsetWidth;
      H = canvas.height = header.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var NUM = Math.min(55, Math.floor((W * H) / 14000));
    for (var i = 0; i < NUM; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.4 + 0.5,
        alpha: Math.random() * 0.4 + 0.12
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // Connection lines
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx = particles[a].x - particles[b].x;
          var dy = particles[a].y - particles[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(96,165,250,' + (0.10 * (1 - dist / 110)) + ')';
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
      // Dots
      particles.forEach(function(p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(96,165,250,' + p.alpha + ')';
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });
      requestAnimationFrame(draw);
    }
    draw();

    // Hide canvas when header collapses
    new MutationObserver(function() {
      canvas.style.display = header.classList.contains('header-top') ? 'none' : '';
    }).observe(header, { attributes: true, attributeFilter: ['class'] });
  }

  /* ============================================================
     HERO DECORATIONS
     ============================================================ */
  function initHeroDecor() {
    var header = document.getElementById('header');
    if (!header) return;

    ['scanlines', 'hero-orb hero-orb-1', 'hero-orb hero-orb-2'].forEach(function(cls) {
      var el = document.createElement('div');
      el.className = cls;
      header.insertBefore(el, header.firstChild);
    });
  }

  /* ============================================================
     REVEAL ON SECTION SHOW
     ============================================================ */
  function revealItems(section) {
    var items = section.querySelectorAll(
      '.icon-box, .portfolio-item, .info-box, .col-md-4, .col-sm-6, .resume-item'
    );
    items.forEach(function(el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i * 0.065) + 's';
      setTimeout(function() { el.classList.add('visible'); }, 60 + i * 65);
    });
  }

  new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      if (m.target.classList.contains('section-show')) {
        revealItems(m.target);
      }
    });
  }).observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });

  /* ============================================================
     NAV MENU
     ============================================================ */
  $(document).on('click', '.nav-menu a, .mobile-nav a', function(e) {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') &&
        location.hostname == this.hostname) {
      var hash = this.hash;
      var target = $(hash);
      if (target.length) {
        e.preventDefault();

        if ($(this).parents('.nav-menu, .mobile-nav').length) {
          $('.nav-menu .active, .mobile-nav .active').removeClass('active');
          $(this).closest('li').addClass('active');
        }

        if (hash == '#header') {
          $('#header').removeClass('header-top');
          $("section").removeClass('section-show');
          return;
        }

        if (!$('#header').hasClass('header-top')) {
          $('#header').addClass('header-top');
          setTimeout(function() {
            $("section").removeClass('section-show');
            $(hash).addClass('section-show');
          }, 350);
        } else {
          $("section").removeClass('section-show');
          $(hash).addClass('section-show');
        }

        if ($('body').hasClass('mobile-nav-active')) {
          $('body').removeClass('mobile-nav-active');
          $('.mobile-nav-toggle i').toggleClass('icofont-navigation-menu icofont-close');
          $('.mobile-nav-overly').fadeOut();
        }
        return false;
      }
    }
  });

  if (window.location.hash) {
    var initial_nav = window.location.hash;
    if ($(initial_nav).length) {
      $('#header').addClass('header-top');
      $('.nav-menu .active, .mobile-nav .active').removeClass('active');
      $('.nav-menu, .mobile-nav').find('a[href="' + initial_nav + '"]').parent('li').addClass('active');
      setTimeout(function() {
        $("section").removeClass('section-show');
        $(initial_nav).addClass('section-show');
      }, 350);
    }
  }

  /* ============================================================
     MOBILE NAV
     ============================================================ */
  if ($('.nav-menu').length) {
    var $mobile_nav = $('.nav-menu').clone().prop({ class: 'mobile-nav d-lg-none' });
    $('body').append($mobile_nav);
    $('body').prepend('<button type="button" class="mobile-nav-toggle d-lg-none"><i class="icofont-navigation-menu"></i></button>');
    $('body').append('<div class="mobile-nav-overly"></div>');

    $(document).on('click', '.mobile-nav-toggle', function() {
      $('body').toggleClass('mobile-nav-active');
      $('.mobile-nav-toggle i').toggleClass('icofont-navigation-menu icofont-close');
      $('.mobile-nav-overly').toggle();
    });
    $(document).click(function(e) {
      var container = $(".mobile-nav, .mobile-nav-toggle");
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        if ($('body').hasClass('mobile-nav-active')) {
          $('body').removeClass('mobile-nav-active');
          $('.mobile-nav-toggle i').toggleClass('icofont-navigation-menu icofont-close');
          $('.mobile-nav-overly').fadeOut();
        }
      }
    });
  } else if ($(".mobile-nav, .mobile-nav-toggle").length) {
    $(".mobile-nav, .mobile-nav-toggle").hide();
  }

  /* ============================================================
     SKILLS / COUNTER / CAROUSEL / ISOTOPE / VENOBOX
     ============================================================ */
  $('.skills-content').waypoint(function() {
    $('.progress .progress-bar').each(function() {
      $(this).css("width", $(this).attr("aria-valuenow") + '%');
    });
  }, { offset: '80%' });

  $("[data-toggle='counter-up']").counterUp({ delay: 10, time: 1000 });

  $(".testimonials-carousel").owlCarousel({
    autoplay: true, dots: true, loop: true,
    responsive: { 0: { items: 1 }, 768: { items: 2 }, 900: { items: 3 } }
  });

  $(window).on('load', function() {
    var portfolioIsotope = $('.portfolio-container').isotope({
      itemSelector: '.portfolio-item', layoutMode: 'fitRows'
    });
    $('#portfolio-flters li').on('click', function() {
      $("#portfolio-flters li").removeClass('filter-active');
      $(this).addClass('filter-active');
      portfolioIsotope.isotope({ filter: $(this).data('filter') });
    });
  });

  $(document).ready(function() {
    $('.venobox').venobox();
  });

  /* ============================================================
     INIT
     ============================================================ */
  $(document).ready(function() {
    initHeroDecor();
    initParticles();

    // Inject "//" prefix into section title h2 elements (avoids inline-flex descender clipping)
    document.querySelectorAll('.section-title h2').forEach(function(h2) {
      if (!h2.querySelector('.title-prefix')) {
        var prefix = document.createElement('span');
        prefix.className = 'title-prefix';
        prefix.textContent = '// ';
        h2.insertBefore(prefix, h2.firstChild);
      }
    });

    // Load Google Fonts if not present
    if (!document.querySelector('link[href*="Syne"]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap';
      document.head.appendChild(link);
    }
  });

})(jQuery);
