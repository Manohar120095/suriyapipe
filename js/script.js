document.addEventListener('DOMContentLoaded', () => {

    // --- Loader ---
    const loader = document.querySelector('.js-loader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('loader-hidden');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 800);
    });

    // --- Header Scroll & Mobile Menu ---
    const header = document.querySelector('.js-header');
    const hamburger = document.querySelector('.js-hamburger');
    const navMenu = document.querySelector('.js-nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTop = document.querySelector('.js-back-top');
    const scrollProgress = document.querySelector('.js-scroll-progress');

    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                handleScroll();
                isScrolling = false;
            });
            isScrolling = true;
        }
    }, { passive: true });

    function handleScroll() {
        // Scroll progress bar
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        if (scrollProgress) {
            scrollProgress.style.width = scrolled + '%';
        }

        // Sticky header
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
            backToTop.classList.add('show');
        } else {
            header.classList.remove('scrolled');
            backToTop.classList.remove('show');
        }

        // Active sections
        let current = '';
        document.querySelectorAll('.section').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= (sectionTop - 250)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (current && href && href.includes(current)) {
                link.classList.add('active');
            }
        });
    }

    // Hamburger Mobile Toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // --- Scroll Animations (Intersection Observer) ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                // Trigger counter animation if it's the stats section
                if (entry.target.classList.contains('stat-item')) {
                    const counter = entry.target.querySelector('.js-counter');
                    if (counter && !counter.classList.contains('counted')) {
                        animateCounter(counter);
                        counter.classList.add('counted');
                    }
                }

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-up-delay').forEach(el => {
        observer.observe(el);
    });

    // --- Stats Counter Animation ---
    function animateCounter(counter) {
        const targetStr = counter.getAttribute('data-target');
        const target = parseFloat(targetStr);

        if (isNaN(target)) {
            counter.innerText = targetStr;
            return;
        }

        const duration = 2000; // ms
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.innerText = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target;
            }
        };
        updateCounter();
    }

    // --- Lightbox Functionality ---
    const galleryItems = document.querySelectorAll('.js-gallery-img');
    const lightbox = document.querySelector('.js-lightbox');
    const lightboxImg = document.querySelector('.js-lightbox-img');
    const lightboxClose = document.querySelector('.js-lightbox-close');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const src = item.getAttribute('data-src');
            lightboxImg.src = src;
            lightbox.classList.add('active');
        });
    });

    lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });
    // --- Enquiry Form Handling ---
    const enquiryForm = document.getElementById('enquiryForm');
    const successPopup = document.getElementById('successPopup');
    const closePopupBtn = document.querySelector('.onclick-close-popup');

    if (enquiryForm) {
        enquiryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(enquiryForm);
            const data = Object.fromEntries(formData.entries());

            // Build a formatted message with all order details
            const orderMessage = `
--- NEW ORDER / ENQUIRY ---
Customer Name: ${data.name || 'N/A'}
Phone: ${data.phone || 'N/A'}
Email: ${data.email || 'N/A'}
Product Type: ${data.product_type || 'N/A'}
Pipe Size: ${data.pipe_size || 'N/A'}
Pipe Color: ${data.pipe_color || 'N/A'}
Quantity: ${data.quantity || 'N/A'}
Delivery Location: ${data.location || 'N/A'}
Additional Message: ${data.message || 'None'}
--- End of Order ---
            `.trim();

            const now = new Date();
            const timeStr = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

            const templateParams = {
                name: data.name,
                email: data.email || 'Not provided',
                title: `New Order – ${data.product_type || 'General Enquiry'}`,
                time: timeStr,
                message: orderMessage
            };

            try {
                const response = await emailjs.send('service_qmrcuw7', 'template_z94vkf4', templateParams);
                console.log('SUCCESS!', response.status, response.text);
                successPopup.classList.add('active');
                enquiryForm.reset();
            } catch (error) {
                console.error('EmailJS Error:', error);
                alert('Oops! There was a problem submitting your enquiry.');
            }
        });
    }

    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', () => {
            successPopup.classList.remove('active');
        });
    }

    if (successPopup) {
        successPopup.addEventListener('click', (e) => {
            if (e.target === successPopup) {
                successPopup.classList.remove('active');
            }
        });
    }

    // --- Payment Popup Handling ---
    const paymentBtn = document.getElementById('paymentBtn');
    const paymentPopup = document.getElementById('paymentPopup');
    const closePaymentBtn = document.querySelector('.onclick-close-payment');

    if (paymentBtn && paymentPopup) {
        paymentBtn.addEventListener('click', () => {
            paymentPopup.classList.add('active');
        });
    }

    if (closePaymentBtn) {
        closePaymentBtn.addEventListener('click', () => {
            paymentPopup.classList.remove('active');
        });
    }

    if (paymentPopup) {
        paymentPopup.addEventListener('click', (e) => {
            if (e.target === paymentPopup) {
                paymentPopup.classList.remove('active');
            }
        });
    }

    // --- Language Translation Logic ---
    const translations = {
        en: {
            // ... (existing en translations)
            logo_text: "SRI SURIYA PIPES",
            logo_subtext: "Kappalur, Madurai",
            nav_home: "Home",
            nav_about: "About Us",
            nav_products: "Products",
            nav_applications: "Applications",
            nav_gallery: "Gallery",
            nav_order: "Order",
            hero_title: "PVC Pipes for <br><span class=\"text-gradient\">Agriculture, Borewell and Electricals etc.</span>",
            hero_subtitle: "Tamil Nadu's most trusted manufacturer and dealer. Delivering durability, precision, and reliable water distribution systems for every need.",
            btn_explore: "Explore Products",
            btn_quote: "Place a Order",
            feat_durable_title: "Durable Pipes",
            feat_durable_desc: "Leak-proof and weather resistant and also with high flexiblity.",
            feat_sizes_title: "Multiple Sizes",
            feat_sizes_desc: "From 1/2 inch up to 12 inches.",
            feat_agri_title: "Applicable",
            feat_agri_desc: "Perfect for irrigation fields and High pressure water fields.",
            feat_reliable_title: "Shipping",
            feat_reliable_desc: "Can able to deliver pipe all over Tamil Nadu.",
            stat_est: "Established Year",
            stat_prod: "Core PVC Products",
            stat_clients: "Happy Clients",
            stat_quality: "Quality Assured",
            about_title: "Established since <span class=\"text-gradient\">2000</span>",
            about_p1: "Located in the SIDCO Industrial Estate at Kappalur, Madurai, Sri Suriya Polymers is a leading manufacturing firm managed by K. Sudhakar. We are dedicated to producing high-quality PVC solutions for agricultural, industrial, and construction needs.",
            about_p2: "Our state-of-the-art infrastructure is spread across a vast area, divided into specialized departments: Manufacturing, Quality Testing, Packing, R&D, and Logistics. This organized structure ensures that every product, from high-quality PVC pipes to custom fittings, meets the highest industry standards.",
            about_l1: "<i class=\"fa-solid fa-check-circle\"></i> ISO Certified Manufacturing",
            about_l2: "<i class=\"fa-solid fa-check-circle\"></i> Advanced Quality Testing Lab",
            about_l3: "<i class=\"fa-solid fa-check-circle\"></i> Modern R&D Department",
            about_l4: "<i class=\"fa-solid fa-check-circle\"></i> Wide Distribution Network",
            btn_contact: "Contact Us",
            prod_title: "Our <span class=\"text-gradient\">Products</span>",
            prod_subtitle: "Comprehensive PVC solutions for every requirement.",
            prod1_title: "High Pressure Pipes",
            prod1_desc: "Durable high-pressure PVC pipes designed for efficient water flow and industrial applications. Available in multiple sizes and colors.",
            prod1a_title: "Agriculture Pipes",
            prod1a_desc: "Reliable agricultural PVC pipes suitable for irrigation, farming, and water distribution systems with long-lasting performance.",
            prod2_title: "Electric & Wiring Pipes",
            prod2_desc: "Fire-retardant electrical conduit pipes for safe wiring in commercial and residential buildings.",
            prod3_title: "Pvc Fittings",
            prod3_desc: "High-quality construction PVC Fittings for  plumbing and Costruction and structural applications.",
            prod4_title: "Water Tanks",
            prod4_desc: "We supply water tanks with high quality and durable and also with various sizes and colors.",
            btn_enquire: "Order",
            btn_order: "Order Now",
            size_title: "PVC Pipe <span class=\"text-gradient\">Size Chart</span>",
            th_cat: "Category",
            th_sizes: "Sizes (Inches)",
            th_colors: "Colors",
            th_apps: "Applications",
            grp_plumbing: "Plumbing & Domestic Waterline",
            grp_elec: "Electrical & Conduit Systems",
            grp_agri: "Agriculture & High Pressure",
            grp_borewell: "Borewell uses",
            grp_ind: "Large Industrial & Specialty",
            app_title: "Key <span class=\"text-gradient\">Applications</span>",
            app1: "Agricultural Irrigation",
            app2: "Borewell Water Supply",
            app3: "Farm Water Distribution",
            app4: "Construction & Plumbing Pipes",
            app5: "Electrical pipes",
            gal_title: "Product <span class=\"text-gradient\">Gallery</span>",
            contact_title: "Get in <span class=\"text-gradient\">Touch</span>",
            addr_title: "Address",
            addr_p: "Sri Suriya Polymers<br>D-42, SIDCO Industrial Estate <br> Near SBI bank <br>Kappalur,Madurai-625008<br>Tamil Nadu",
            prop_title: "Proprietor",
            prop_p: "K. Sudhakar<br>(Owner)",
            phone_title: "Phone",
            form_title: "Order / Enquiry Form",
            form_subtitle: "Fill out the details below. We accept **Cash, Cheque, DD, and Online Bank Transfers.",
            lbl_name: "Customer Name *",
            lbl_phone: "Phone Number *",
            lbl_email: "Email Address",
            lbl_prod: "Product Type *",
            opt_select_prod: "Select Product...",
            opt_agri: "Agricultural PVC Pipes",
            opt_construction: "Construction PVC Pipes",
            opt_high_pressure: "High Pressure PVC Pipes",
            opt_upvc: "UPVC Pipes",
            opt_electrical: "Electrical Pipes",
            opt_water_tanks: "Water Tanks",
            lbl_size: "Pipe Size",
            opt_select_size: "Select Size...",
            lbl_color: "Pipe Color",
            opt_select_color: "Select Color...",
            lbl_qty: "Quantity *",
            lbl_loc: "Delivery Location *",
            lbl_msg: "Additional Message",
            btn_send: "Send Order <i class=\"fa-solid fa-paper-plane ms-2\"></i>",
            footer_desc: "Tamil Nadu's Trusted manufacturer of agricultural and electrical PVC pipes and even more products.",
            footer_copy: "&copy; 2026 Sri Suriya Polymers. All Rights Reserved. Designed by RAHONAM Creations.",
            pop_title: "Thanks for Ordering!",
            pop_desc: "Your enquiry has been sent to our team. We will get back to you shortly.",
            pop_btn: "Great!",
            pay_note: "Already ordered? Pay here:",
            btn_payment: "Show Payment QR",
            pay_title: "Scan to Pay",
            pay_desc: "Scan this QR code using any UPI app (GPay, PhonePe, etc.) to make the payment.",
            pay_btn: "Close",
            // Bot Strings
            bot_name: "Suriya Assistant",
            bot_online: "Online",
            bot_welcome: "Hello! How can I help you today regarding Sri Suriya Pipes?",
            bot_placeholder: "Type a message...",
            bot_default: "I'm sorry, I didn't quite catch that. You can ask about our products, location, or contact details.",
            bot_prod_ans: "We offer High Pressure Agri Pipes, Electrical Conduit Pipes, Construction PVC, Plastic Barrels, and even more products.",
            bot_loc_ans: "We are located at SIDCO Industrial Estate, D-42, Kappalur, Madurai, Tamil Nadu - 625008.",
            bot_contact_ans: "You can reach us at +91 99941 66671 or 0452 2489895.",
            bot_owner_ans: "Sri Suriya Polymers is owned and managed by Mr. K. Sudhakar.",
            bot_est_ans: "We have been serving our customers since 2000."
        },
        ta: {
            logo_text: "ஸ்ரீ சூர்யா பைப்ஸ்",
            logo_subtext: "கப்பலூர், மதுரை",
            nav_home: "முகப்பு",
            nav_about: "எங்களைப் பற்றி",
            nav_products: "தயாரிப்புகள்",
            nav_applications: "பயன்பாடுகள்",
            nav_gallery: "கேலரி",
            nav_order: "ஆர்டர்",
            hero_title: "விவசாயம், போர்வெல் மற்றும் மின்சாரத்திற்கான <br><span class=\"text-gradient\">PVC குழாய்கள் மற்றும் பல..</span>",
            hero_subtitle: "தமிழ்நாட்டின் மிகவும் நம்பகமான உற்பத்தியாளர் மற்றும் டீலர். நீடித்த உழைப்பு, துல்லியம் மற்றும் நம்பகமான நீர் விநியோக அமைப்புகளை வழங்குகிறது....",
            btn_explore: "தயாரிப்புகளை ஆராயுங்கள்",
            btn_quote: "ஆர்டர் செய்யுங்கள்",
            feat_durable_title: "நீடித்த குழாய்கள்",
            feat_durable_desc: "கசிவு இல்லாதது, வானிலை எதிர்ப்பு மற்றும் அதிக நெகிழ்வுத்தன்மை கொண்டது.",
            feat_sizes_title: "பல அளவுகள்",
            feat_sizes_desc: "1/2 அங்குலம் முதல் 12 அங்குலம் வரை.",
            feat_agri_title: "பயன்படுத்தக்கூடியது",
            feat_agri_desc: "பாசன வயல்கள் மற்றும் உயர் அழுத்த நீர் நிலைகளுக்கு ஏற்றது.",
            feat_reliable_title: "ஷிப்பிங்",
            feat_reliable_desc: "தமிழ்நாடு முழுவதும் பைப் விநியோகம் செய்ய முடியும்.",
            stat_est: "நிறுவப்பட்ட ஆண்டு",
            stat_prod: "முக்கிய பிவிசி தயாரிப்புகள்",
            stat_clients: "மகிழ்ச்சியான வாடிக்கையாளர்கள்",
            stat_quality: "தரம் உறுதி செய்யப்பட்டது",
            about_title: "<span class=\"text-gradient\">2000</span> முதல் நிறுவப்பட்டது",
            about_p1: "மதுரை கப்பலூர் சிட்கோ தொழிற்பேட்டையில் அமைந்துள்ள ஸ்ரீ சூர்யா பாலிமர்ஸ், கோவில்பிச்சை சுதாகர் என்பவரால் நிர்வகிக்கப்படும் ஒரு முன்னணி நிறுவனம் ஆகும். விவசாயம், தொழில் மற்றும் கட்டுமானத் தேவைகளுக்கான உயர்தர பிவிசி தீர்வுகளை உருவாக்க நாங்கள் அர்ப்பணித்துள்ளோம்.",
            about_p2: "எங்கள் நவீன உள்கட்டமைப்பு ஒரு பரந்த பகுதியில் பரவியுள்ளது, உற்பத்தியாளர், தர சோதனை, பேக்கிங், ஆர்&டி மற்றும் லாஜிஸ்டிக்ஸ் என பிரிக்கப்பட்டுள்ளது. இந்த ஒழுங்கமைக்கப்பட்ட அமைப்பு, விவசாயம், போர்வெல், மின்சாரம், கட்டுமானம் போன்ற அனைத்து தயாரிப்புகளும் மிக உயர்ந்த தரத்துடன் இருப்பதை உறுதி செய்கிறது.",
            about_l1: "<i class=\"fa-solid fa-check-circle\"></i> ISO சான்றளிக்கப்பட்ட உற்பத்தி",
            about_l2: "<i class=\"fa-solid fa-check-circle\"></i> மேம்பட்ட தர சோதனை ஆய்வகம்",
            about_l3: "<i class=\"fa-solid fa-check-circle\"></i> நவீன ஆர்&டி துறை",
            about_l4: "<i class=\"fa-solid fa-check-circle\"></i> பரந்த விநியோக வலையமைப்பு",
            btn_contact: "எங்களைத் தொடர்பு கொள்ளவும்",
            prod_title: "எங்கள் <span class=\"text-gradient\">தயாரிப்புகள்</span>",
            prod_subtitle: "ஒவ்வொரு தேவைக்கும் விரிவான பிவிசி தீர்வுகள்.",
            prod1_title: "உயர் அழுத்த குழாய்கள்",
            prod1_desc: "திறமையான நீர் ஓட்டம் மற்றும் தொழில்துறை பயன்பாடுகளுக்காக வடிவமைக்கப்பட்ட நீடித்த உயர் அழுத்த பிவிசி குழாய்கள். பல அளவுகள் மற்றும் வண்ணங்களில் கிடைக்கிறது.",
            prod1a_title: "விவசாய குழாய்கள்",
            prod1a_desc: "பாசனம், விவசாயம் மற்றும் நீர் விநியோக அமைப்புகளுக்கு ஏற்ற நம்பகமான விவசாய பிவிசி குழாய்கள்.",
            prod2_title: "மின்சார மற்றும் வயரிங் குழாய்கள்",
            prod2_desc: "வணிக மற்றும் குடியிருப்பு கட்டிடங்களில் பாதுகாப்பான வயரிங்கிற்கான தீ தடுப்பு மின்சார வழித்தட குழாய்கள்.",
            prod3_title: "பிவிசி ஃபிட்டிங்க்ஸ்",
            prod3_desc: "பிளம்பிங் மற்றும் கட்டுமானப் பயன்பாடுகளுக்கான உயர்தர பிவிசி ஃபிட்டிங்க்ஸ்.",
            prod4_title: "தண்ணீர் தொட்டிகள்",
            prod4_desc: "உயர்தர மற்றும் நீடித்த நீர் தொட்டிகளை பல்வேறு அளவுகள் மற்றும் வண்ணங்களில் நாங்கள் வழங்குகிறோம்.",
            btn_enquire: "ஆர்டர்",
            btn_order: "இப்போதே ஆர்டர் செய்யுங்கள்",
            size_title: "பிவிசி பைப் <span class=\"text-gradient\">அளவு விளக்கப்படம்</span>",
            th_cat: "வகை",
            th_sizes: "அளவுகள் (அங்குலங்கள்)",
            th_colors: "நிறங்கள்",
            th_apps: "பயன்பாடுகள்",
            grp_plumbing: "பிளம்பிங் மற்றும் வீட்டு நீர் இணைப்பு",
            grp_elec: "மின்சார மற்றும் வழித்தட அமைப்புகள்",
            grp_agri: "விவசாயம் மற்றும் உயர் அழுத்தம்",
            grp_borewell: "போர்வெல் பயன்பாடுகள்",
            grp_ind: "பெரிய தொழில்துறை மற்றும் சிறப்பு",
            app_title: "முக்கிய <span class=\"text-gradient\">பயன்பாடுகள்</span>",
            app1: "விவசாய பாசனம்",
            app2: "போர்வெல் நீர் வழங்கல்",
            app3: "பண்ணை நீர் விநியோகம்",
            app4: "கட்டுமான பிளம்பிங்",
            app5: "மின்சார வழித்தடங்கள்",
            gal_title: "தயாரிப்பு <span class=\"text-gradient\">கேலரி</span>",
            contact_title: "<span class=\"text-gradient\">தொடர்பு</span> கொள்ள",
            addr_title: "முகவரி",
            addr_p: "ஸ்ரீ சூர்யா பாலிமர்ஸ்<br>சிட்கோ தொழிற்பேட்டை, டி-42<br>கப்பலூர்<br>மதுரை, தமிழ்நாடு – 625008",
            prop_title: "உரிமையாளர்",
            prop_p: "கோவில்பிச்சை சுதாகர்<br>(உரிமையாளர்)",
            phone_title: "தொலைபேசி",
            form_title: "ஆர்டர் / விசாரணை படிவம்",
            form_subtitle: "கீழே உள்ள விவரங்களை நிரப்பவும். நாங்கள் **ரொக்கம், காசோலை, டிடி மற்றும் ஆன்லைன் வங்கி இடமாற்றங்களை** ஏற்றுக்கொள்கிறோம்.",
            lbl_name: "வாடிக்கையாளர் பெயர் *",
            lbl_phone: "தொலைபேசி எண் *",
            lbl_email: "மின்னஞ்சல் முகவரி",
            lbl_prod: "தயாரிப்பு வகை *",
            opt_select_prod: "தயாரிப்பைத் தேர்ந்தெடுக்கவும்...",
            opt_agri: "விவசாய பிவிசி குழாய்கள்",
            opt_construction: "கட்டுமான பிவிசி குழாய்கள்",
            opt_high_pressure: "உயர் அழுத்த பிவிசி குழாய்கள்",
            opt_upvc: "யுபிவிசி குழாய்கள்",
            opt_electrical: "மின்சார குழாய்கள்",
            opt_water_tanks: "தண்ணீர் தொட்டிகள்",
            lbl_size: "குழாய் அளவு",
            opt_select_size: "அளவைத் தேர்ந்தெடுக்கவும்...",
            lbl_color: "குழாய் நிறம்",
            opt_select_color: "நிறத்தைத் தேர்ந்தெடுக்கவும்...",
            lbl_qty: "அளவு *",
            lbl_loc: "விநியோக இடம் *",
            lbl_msg: "கூடுதல் செய்தி",
            btn_send: "விசாரணையை அனுப்பு <i class=\"fa-solid fa-paper-plane ms-2\"></i>",
            footer_desc: "மதுரையின் விவசாயம் மற்றும் மின்சார பிவிசி குழாய்களின் பிரீமியம் உற்பத்தியாளர்.",
            footer_copy: "&copy; 2026 ஸ்ரீ சூர்யா பாலிமர்ஸ். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. ஆன்டிகிராவிட்டியால் வடிவமைக்கப்பட்டது.",
            pop_title: "ஆர்டர் செய்ததற்கு நன்றி!",
            pop_desc: "உங்கள் விசாரணை எங்கள் குழுவிற்கு அனுப்பப்பட்டுள்ளது. நாங்கள் விரைவில் உங்களைத் தொடர்பு கொள்வோம்.",
            pop_btn: "அற்புதம்!",
            pay_note: "ஏற்கனவே ஆர்டர் செய்தீர்களா? இங்கே பணம் செலுத்துங்கள்:",
            btn_payment: "பணம் செலுத்தும் QR குறியீட்டைக் காட்டு",
            pay_title: "ஸ்கேன் செய்து பணம் செலுத்துங்கள்",
            pay_desc: "பணம் செலுத்த ஏதேனும் ஒரு UPI செயலியை (GPay, PhonePe போன்றவை) பயன்படுத்தி இந்த QR குறியீட்டை ஸ்கேன் செய்யவும்.",
            pay_btn: "மூடுக",
            // Bot Strings
            bot_name: "சூர்யா உதவியாளர்",
            bot_online: "ஆன்லைனில்",
            bot_welcome: "வணக்கம்! ஸ்ரீ சூர்யா பைப்ஸ் குறித்து இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
            bot_placeholder: "செய்தியைத் தட்டச்சு செய்க...",
            bot_default: "மன்னிக்கவும், என்னால் புரிந்து கொள்ள முடியவில்லை. எங்கள் தயாரிப்புகள், இருப்பிடம் அல்லது தொடர்பு விவரங்கள் குறித்து நீங்கள் கேட்கலாம்.",
            bot_prod_ans: "நாங்கள் உயர் அழுத்த விவசாய குழாய்கள், மின்சார வழித்தட குழாய்கள், கட்டுமான பிவிசி, யூபிவிசி, பிளாஸ்டிக் பீப்பாய்கள் மற்றும் பிவிசி தூள் ஆகியவற்றை வழங்குகிறோம்.",
            bot_loc_ans: "நாங்கள் மதுரை, கப்பலூர், டி-42, சிட்கோ தொழிற்பேட்டையில் அமைந்துள்ளோம்.",
            bot_contact_ans: "நீங்கள் எங்களை +91 99941 66671 அல்லது +91 98765 43211 எண்ணில் தொடர்பு கொள்ளலாம்.",
            bot_owner_ans: "ஸ்ரீ சூர்யா பாலிமர்ஸ் திரு. கோவில்பிச்சை சுதாகர் அவர்களால் நிர்வகிக்கப்படுகிறது.",
            bot_est_ans: "நாங்கள் 2000 முதல் எங்கள் வாடிக்கையாளர்களுக்கு சேவை செய்து வருகிறோம்."
        }
    };

    const langBtn = document.getElementById('langSwitch');
    const langCode = langBtn.querySelector('.lang-code');
    let currentLang = localStorage.getItem('preferredLang') || 'en';

    function setLanguage(lang) {
        // Handle innerHTML translations
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });

        // Handle attribute translations (e.g., placeholder)
        document.querySelectorAll('[data-i18n-attr]').forEach(el => {
            const attrData = el.getAttribute('data-i18n-attr').split(':');
            if (attrData.length === 2) {
                const attrName = attrData[0];
                const key = attrData[1];
                if (translations[lang][key]) {
                    el.setAttribute(attrName, translations[lang][key]);
                }
            }
        });

        localStorage.setItem('preferredLang', lang);
        currentLang = lang;

        document.documentElement.lang = lang;
    }

    // --- Chat Bot UI Logic ---
    const botContainer = document.querySelector('.js-bot-container');
    const botTrigger = document.querySelector('.js-bot-trigger');
    const botWindow = document.querySelector('.js-bot-window');
    const botClose = document.querySelector('.js-bot-close');
    const botInput = document.querySelector('.js-bot-input');
    const botSend = document.querySelector('.js-bot-send');
    const botMessages = document.querySelector('.js-bot-messages');

    if (botTrigger) {
        botTrigger.addEventListener('click', () => {
            botWindow.classList.toggle('active');
        });
    }

    if (botClose) {
        botClose.addEventListener('click', () => {
            botWindow.classList.remove('active');
        });
    }

    function appendMessage(text, side) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${side === 'user' ? 'user-msg' : 'bot-msg'}`;
        msgDiv.innerHTML = `<p>${text}</p>`;
        botMessages.appendChild(msgDiv);
        botMessages.scrollTop = botMessages.scrollHeight;
    }

    function handleBotResponse(userText) {
        const input = userText.toLowerCase();
        let responseKey = 'bot_default';

        if (input.includes('product') || input.includes('pipe') || input.includes('தயாரிப்பு') || input.includes('பைப்')) {
            responseKey = 'bot_prod_ans';
        } else if (input.includes('location') || input.includes('address') || input.includes('where') || input.includes('இருப்பிடம்') || input.includes('முகவரி')) {
            responseKey = 'bot_loc_ans';
        } else if (input.includes('contact') || input.includes('phone') || input.includes('number') || input.includes('தொடர்பு') || input.includes('போன்')) {
            responseKey = 'bot_contact_ans';
        } else if (input.includes('owner') || input.includes('proprietor') || input.includes('who') || input.includes('உரிமையாளர்')) {
            responseKey = 'bot_owner_ans';
        } else if (input.includes('established') || input.includes('since') || input.includes('year') || input.includes('எப்போது')) {
            responseKey = 'bot_est_ans';
        }

        // Add typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-msg typing-indicator';
        typingDiv.innerHTML = '<p>...</p>';
        botMessages.appendChild(typingDiv);
        botMessages.scrollTop = botMessages.scrollHeight;

        setTimeout(() => {
            typingDiv.remove();
            appendMessage(translations[currentLang][responseKey], 'bot');
        }, 1000);
    }

    function sendMessage() {
        const text = botInput.value.trim();
        if (text) {
            appendMessage(text, 'user');
            botInput.value = '';
            handleBotResponse(text);
        }
    }

    if (botSend) {
        botSend.addEventListener('click', sendMessage);
    }

    if (botInput) {
        botInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // Initialize language
    setLanguage(currentLang);

    langBtn.addEventListener('click', () => {
        const nextLang = currentLang === 'en' ? 'ta' : 'en';
        setLanguage(nextLang);
    });

    // --- Dynamic Pipe Size Dropdown ---
    const productTypeSelect = document.getElementById('productType');
    const pipeSizeSelect = document.getElementById('pipeSize');

    const productSizes = {
        "Agri_Pipes": ["1/2 inch", "3/4 inch", "1 inch", "1 1/4 inch", "1 1/2 inch", "2 inch", "2 1/2 inch", "3 inch", "4 inch", "5 inch", "6 inch", "7 inch", "8 inch", "10 inch", "12 inch"],
        "Construction": ["1/2 inch", "3/4 inch", "1 inch", "1 1/4 inch", "1 1/2 inch", "2 inch", "2 1/2 inch", "3 inch", "4 inch", "5 inch", "6 inch", "7 inch", "8 inch", "10 inch", "12 inch"],
        "HighPressure": ["1/2 inch", "3/4 inch", "1 inch", "1 1/4 inch", "1 1/2 inch", "2 inch", "2 1/2 inch", "3 inch", "4 inch"],
        "UPVC": ["1/2 inch", "3/4 inch", "1 inch"],
        "Electrical_Pipes": ["1/2 inch", "3/4 inch", "1 inch"],
        "WaterTanks": ["500 Liters", "750 Liters", "1000 Liters", "2000 Liters"]
    };

    if (productTypeSelect && pipeSizeSelect) {
        productTypeSelect.addEventListener('change', function () {
            const selectedProduct = this.value;

            // Clear existing options except placeholder
            pipeSizeSelect.innerHTML = `<option value="" data-i18n="opt_select_size">${translations[currentLang].opt_select_size}</option>`;

            if (selectedProduct && productSizes[selectedProduct]) {
                productSizes[selectedProduct].forEach(size => {
                    const option = document.createElement('option');
                    option.value = size;
                    option.textContent = size;
                    pipeSizeSelect.appendChild(option);
                });
            }
        });
    }
});
