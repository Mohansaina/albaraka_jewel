/* =========================================================
   AL BARAKA | HIGH JEWELRY
   Optimized Javascript Engine & Shopping Cart
   GSAP, Lenis, Vanilla JS
   ========================================================= */

   document.addEventListener("DOMContentLoaded", function () {
    
    // --------------------------------------------------
    // 1. Lenis Smooth Scrolling (Extremely fast)
    // --------------------------------------------------
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // --------------------------------------------------
    // 2. Custom Lightweight Cursor
    // --------------------------------------------------
    const cursor = document.getElementById("cursor");
    
    // Only run custom cursor on desktop
    if (window.matchMedia("(min-width: 768px)").matches) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = window.innerWidth / 2;
        let cursorY = window.innerHeight / 2;

        window.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const loop = () => {
            // Lerp (linear interpolation) for smooth following
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            
            if (cursor) {
                cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);

        // Add hover effect for links and buttons
        const hoverElements = document.querySelectorAll("a, button, .custom-hover");
        hoverElements.forEach(el => {
            el.addEventListener("mouseenter", () => cursor.classList.add("hovered"));
            el.addEventListener("mouseleave", () => cursor.classList.remove("hovered"));
        });
    }

    // --------------------------------------------------
    // 3. Preloader Animation
    // --------------------------------------------------
    const loaderTL = gsap.timeline({
        onComplete: () => {
            document.body.classList.remove('loading');
            initScrollAnimations();
        }
    });

    loaderTL.to(".loader-logo", {
        y: 0,
        opacity: 1,
        duration: 2,
        ease: "expo.out",
        delay: 0.2
    }, "start")
    .to(".loader-progress", {
        width: "80%",
        duration: 2,
        ease: "power3.inOut"
    }, "start")
    .to("#loader", {
        y: "-100%",
        duration: 1.2,
        ease: "expo.inOut",
        delay: 0.5
    })
    .to(".hero-bg", {
        scale: 1,
        duration: 2,
        ease: "power2.out"
    }, "-=0.8")
    .to(".hero-content", {
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: "expo.out"
    }, "-=1.5");

    // --------------------------------------------------
    // 4. GSAP Scroll Animations
    // --------------------------------------------------
    function initScrollAnimations() {
        // Hero Background Parallax
        gsap.to(".hero-bg", {
            yPercent: 15,
            ease: "none",
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });

        // Heritage text reveal
        gsap.from(".giant-text", {
            y: 100,
            opacity: 0,
            duration: 1.5,
            ease: "expo.out",
            scrollTrigger: {
                trigger: ".heritage",
                start: "top 70%"
            }
        });

        // Atelier Bento Boxes staggered appearance
        gsap.from(".bento-item", {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".atelier",
                start: "top 60%"
            }
        });

        // Shop Products staggered appearance
        gsap.from(".product-card", {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "expo.out",
            scrollTrigger: {
                trigger: ".shop",
                start: "top 70%"
            }
        });

        // Instagram Feed staggered appearance
        gsap.from(".insta-item", {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.15,
            ease: "expo.out",
            scrollTrigger: {
                trigger: ".instagram",
                start: "top 70%"
            }
        });
    }

    // --------------------------------------------------
    // 5. Shopping Cart Logic
    // --------------------------------------------------
    let cart = [];
    
    const cartCountEl = document.getElementById("cart-count");
    const cartOverlay = document.getElementById("cart-overlay");
    const cartSidebar = document.getElementById("cart-sidebar");
    const openCartBtn = document.getElementById("open-cart");
    const closeCartBtn = document.getElementById("close-cart");
    const cartItemsContainer = document.getElementById("cart-items-container");
    const cartTotalPriceEl = document.getElementById("cart-total-price");
    const checkoutBtn = document.getElementById("checkout-btn");

    // Open/Close Cart Sidebar
    function toggleCart() {
        cartOverlay.classList.toggle("active");
        cartSidebar.classList.toggle("active");
    }

    openCartBtn.addEventListener("click", toggleCart);
    closeCartBtn.addEventListener("click", toggleCart);
    cartOverlay.addEventListener("click", toggleCart);

    // Update Cart UI
    function updateCartUI() {
        // Update count
        cartCountEl.innerText = cart.length;

        // Update items HTML
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your bag is currently empty.</div>';
            cartTotalPriceEl.innerText = '$0.00';
            return;
        }

        let itemsHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            total += parseFloat(item.price);
            itemsHTML += `
                <div class="cart-item">
                    <img src="${item.img}" alt="${item.title}">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.title}</h4>
                        <p class="cart-item-price">$${Number(item.price).toLocaleString()}</p>
                        <button class="cart-item-remove" data-index="${index}">Remove</button>
                    </div>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = itemsHTML;
        cartTotalPriceEl.innerText = '$' + total.toLocaleString();

        // Attach remove event listeners
        document.querySelectorAll(".cart-item-remove").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const index = e.target.getAttribute("data-index");
                cart.splice(index, 1);
                updateCartUI();
            });
        });
    }

    // Add to Cart
    document.querySelectorAll(".btn-add-cart").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const product = {
                id: e.target.getAttribute("data-id"),
                title: e.target.getAttribute("data-title"),
                price: e.target.getAttribute("data-price"),
                img: e.target.getAttribute("data-img")
            };
            cart.push(product);
            
            // Change button text temporarily
            const originalText = e.target.innerText;
            e.target.innerText = "Added!";
            setTimeout(() => { e.target.innerText = originalText; }, 1000);

            updateCartUI();
            
            // Automatically open cart sidebar to show the user
            if(!cartSidebar.classList.contains("active")) {
                toggleCart();
            }
        });
    });

    // Simulated Checkout
    checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) return;
        
        checkoutBtn.innerText = "Processing...";
        setTimeout(() => {
            alert("Thank you for your purchase from Al Baraka High Jewelry!");
            cart = [];
            updateCartUI();
            toggleCart();
            checkoutBtn.innerText = "Proceed to Checkout";
        }, 1500);
    });

    // --------------------------------------------------
    // 6. Light / Dark Mode Toggle
    // --------------------------------------------------
    const themeToggleBtn = document.getElementById("theme-toggle");
    
    // Check saved preference
    const savedTheme = localStorage.getItem("albaraka_theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        themeToggleBtn.innerText = "DARK MODE";
    }

    themeToggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        document.body.classList.toggle("light-mode");
        
        if (document.body.classList.contains("light-mode")) {
            localStorage.setItem("albaraka_theme", "light");
            themeToggleBtn.innerText = "DARK MODE";
        } else {
            localStorage.setItem("albaraka_theme", "dark");
            themeToggleBtn.innerText = "LIGHT MODE";
        }
    });

});
