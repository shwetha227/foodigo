document.addEventListener('DOMContentLoaded', () => {
    const customerBtn = document.getElementById('customerBtn');
    const restaurantBtn = document.getElementById('restaurantBtn');
    const deliveryPartnerBtn = document.getElementById('deliveryPartnerBtn');

    const loginFormContainer = document.getElementById('loginFormContainer');
    const signupFormContainer = document.getElementById('signupFormContainer');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');

    const loginRoleInput = document.getElementById('loginRole');
    const signupRoleInput = document.getElementById('signupRole');

    // Handle role selection on index.html
    function handleRoleSelection(role) {
        localStorage.setItem('selectedRole', role); // Store role
        window.location.href = 'login.html'; // Redirect to login/signup page
    }

    if (customerBtn) {
        customerBtn.addEventListener('click', () => handleRoleSelection('customer'));
    }
    if (restaurantBtn) {
        restaurantBtn.addEventListener('click', () => handleRoleSelection('restaurant'));
    }
    if (deliveryPartnerBtn) {
        deliveryPartnerBtn.addEventListener('click', () => handleRoleSelection('delivery_partner'));
    }

    // Handle form toggling on login.html
    if (showSignup) {
        showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginFormContainer) loginFormContainer.style.display = 'none';
            if (signupFormContainer) signupFormContainer.style.display = 'block';
        });
    }

    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            if (signupFormContainer) signupFormContainer.style.display = 'none';
            if (loginFormContainer) loginFormContainer.style.display = 'block';
        });
    }

    // Set the role in the hidden input fields on login.html
    const selectedRole = localStorage.getItem('selectedRole');
    if (selectedRole) {
        if (loginRoleInput) loginRoleInput.value = selectedRole;
        if (signupRoleInput) signupRoleInput.value = selectedRole;
        // Potentially change form titles or fields based on role here if needed
        if (loginFormContainer || signupFormContainer) {
            const formTitle = document.querySelector('h2'); // Get the first h2, assuming it's the title
            if (formTitle) {
                // formTitle.textContent += ` (${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)})`;
            }
        }
    }

    // Handle Login Form Submission (Updated to use backend URL)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const role = loginRoleInput.value;
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            try {
                const response = await fetch('http://localhost:3001/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role, email, password })
                });
                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('userId', data.userId);
                    localStorage.setItem('userName', data.name);
                    localStorage.setItem('role', role);
                    if (role === 'customer') {
                        window.location.href = 'customer_dashboard.html';
                    } else if (role === 'restaurant') {
                        window.location.href = 'restaurant_dashboard.html';
                    } else if (role === 'delivery_partner') {
                        window.location.href = 'delivery_dashboard.html';
                    }
                } else {
                    alert(data.message || 'Login failed.');
                }
            } catch (err) {
                alert('An error occurred during login.');
            }
        });
    }

    // Handle Signup Form Submission (Updated to use backend URL)
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const role = signupRoleInput.value;
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            try {
                const response = await fetch('http://localhost:3001/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role, name, email, password })
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Signup successful! Please login.');
                    if (showLogin) showLogin.click();
                } else {
                    alert(data.message || 'Signup failed.');
                }
            } catch (err) {
                console.error(err);
                alert('An error occurred during signup.');
            }
        });
    }

    // Load restaurants on customer_dashboard.html (Placeholder)
    if (window.location.pathname.endsWith('customer_dashboard.html')) {
        loadRestaurants();
    }

    async function loadRestaurants() {
        const restaurantGrid = document.getElementById('restaurantGrid');
        if (!restaurantGrid) return;

        // 10 Indian restaurant names and relevant Indian food/restaurant images
        const placeholderRestaurants = [
            { id: 1, name: 'Oota Bangalore', banner: 'https://oota.in/images/Menu-Collage-Oota-100-min.jpg' },
            { id: 2, name: 'Vidyarthi Bhavan', banner: 'https://tse2.mm.bing.net/th?id=OIP.fM0VAXXp2TI5SL8iUbKuIwHaFy&pid=Api&P=0&h=180' },
            { id: 3, name: "Koshy's", banner: 'https://tse3.mm.bing.net/th?id=OIP.SqfR5P5jRNql9LvtzSTCtQHaDt&pid=Api&P=0&h=180' },
            { id: 4, name: 'Sharief Bhai', banner: 'https://d4t7t8y8xqo0t.cloudfront.net/resized/750X436/restaurant/683995/restaurant020220705094910.jpg' },
            { id: 5, name: 'Paakashala', banner: 'https://tse3.mm.bing.net/th?id=OIP.gy5cC66xD5vUYOAMRL1mgAHaFh&pid=Api&P=0&h=180' },
            { id: 6, name: 'Jamavar', banner: 'https://tse3.mm.bing.net/th?id=OIP.T13GZyf6zRMPHxdO_RNKvgHaE7&pid=Api&P=0&h=180' },
            { id: 7, name: 'Feast', banner: 'https://tse2.mm.bing.net/th?id=OIP.bAfBNg3X42g61O8aXe9SLAHaEd&pid=Api&P=0&h=180' },
            { id: 8, name: 'Grand Mercure Mysore', banner: 'https://tse3.mm.bing.net/th?id=OIP.B_Jt9E-t3Eljx2qWyLSHiQHaFG&pid=Api&P=0&h=180' },
            { id: 9, name: 'Taj Bangalore', banner: 'https://tse2.mm.bing.net/th?id=OIP.MAKUklU_u2bHnEpusGiohwHaE8&pid=Api&P=0&h=180' },
            { id: 10, name: "St. Mark's Hotel", banner: 'https://tse4.mm.bing.net/th?id=OIP.sL0FIBFmQrXf3srqAQixCAHaFj&pid=Api&P=0&h=180' }
        ];

        restaurantGrid.innerHTML = '';

        placeholderRestaurants.forEach(restaurant => {
            const card = document.createElement('div');
            card.className = 'restaurant-card';

            // Restaurant banner image
            if (restaurant.banner) {
                const img = document.createElement('img');
                img.src = restaurant.banner;
                img.alt = restaurant.name;
                img.style.width = '100%';
                img.style.borderRadius = '8px 8px 0 0';
                img.style.marginBottom = '10px';
                card.appendChild(img);
            }

            const name = document.createElement('h3');
            name.textContent = restaurant.name;
            card.appendChild(name);

            // Add click event to go to menu page
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                localStorage.setItem('selectedRestaurantId', restaurant.id);
                localStorage.setItem('selectedRestaurantName', restaurant.name);
                window.location.href = 'restaurant_menu.html';
            });

            restaurantGrid.appendChild(card);
        });
    }

    // Show food items for selected restaurant on restaurant_menu.html
    if (window.location.pathname.endsWith('restaurant_menu.html')) {
        const restaurantName = localStorage.getItem('selectedRestaurantName') || 'Restaurant Menu';
        document.getElementById('restaurantName').textContent = restaurantName;
        const foodGrid = document.getElementById('foodGrid');
        const restaurantId = localStorage.getItem('selectedRestaurantId');

        // Handle feedback form submission
        const feedbackForm = document.getElementById('feedbackForm');
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const rating = document.getElementById('rating').value;
                const feedbackText = document.getElementById('feedbackText').value;
                const userId = localStorage.getItem('userId'); // Assuming you store user ID after login

                if (!userId) {
                    alert('Please login to submit feedback');
                    return;
                }

                try {
                    const response = await fetch('http://localhost:3001/api/feedback', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            restaurantId,
                            customerId: userId,
                            rating,
                            comment: feedbackText,
                            timestamp: new Date().toISOString()
                        })
                    });

                    if (response.ok) {
                        alert('Thank you for your feedback!');
                        feedbackForm.reset();
                        // Refresh the feedback display
                        loadRestaurantFeedback();
                    } else {
                        const data = await response.json();
                        alert(data.message || 'Failed to submit feedback');
                    }
                } catch (error) {
                    console.error('Error submitting feedback:', error);
                    alert('Failed to submit feedback. Please try again.');
                }
            });
        }

        // Function to load restaurant feedback
        async function loadRestaurantFeedback() {
            const restaurantFeedback = document.getElementById('restaurantFeedback');
            try {
                const response = await fetch(`/api/feedback/${restaurantId}`);
                if (response.ok) {
                    const feedbacks = await response.json();
                    restaurantFeedback.innerHTML = feedbacks.map(feedback => `
                        <div class="feedback-item">
                            <div class="feedback-rating">${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}</div>
                            <div class="feedback-text">${feedback.feedbackText}</div>
                            <div class="feedback-author">- ${feedback.userName}</div>
                            <div class="feedback-date">${new Date(feedback.timestamp).toLocaleDateString()}</div>
                        </div>
                    `).join('');
                } else {
                    restaurantFeedback.innerHTML = '<p>No feedback available yet.</p>';
                }
            } catch (error) {
                console.error('Error loading feedback:', error);
                restaurantFeedback.innerHTML = '<p>Error loading feedback.</p>';
            }
        }

        // Load initial feedback
        loadRestaurantFeedback();

        // Restaurant information data
        const restaurantInfo = {
            1: {
                about: "Oota Bangalore is a premium dining destination offering authentic South Indian cuisine with a modern twist. Established in 2015, we take pride in serving traditional flavors with contemporary presentation.",
                feedback: [
                    { rating: "★★★★★", text: "Amazing food and great ambiance!", author: "Rahul S." },
                    { rating: "★★★★☆", text: "Best masala dosa in town!", author: "Priya M." },
                    { rating: "★★★★★", text: "Excellent service and authentic taste.", author: "Karthik R." }
                ]
            },
            2: {
                about: "Vidyarthi Bhavan is a legendary restaurant known for its iconic masala dosa and traditional South Indian breakfast items. With over 75 years of heritage, we continue to serve authentic flavors.",
                feedback: [
                    { rating: "★★★★★", text: "Classic taste that never disappoints!", author: "Anand K." },
                    { rating: "★★★★☆", text: "Must visit for authentic dosa lovers.", author: "Meera P." },
                    { rating: "★★★★★", text: "The best breakfast place in Bangalore!", author: "Suresh R." }
                ]
            },
            // Add info for other restaurants (3-10) with similar structure
        };

        // Populate restaurant information
        const restaurantAbout = document.getElementById('restaurantAbout');
        const restaurantFeedback = document.getElementById('restaurantFeedback');

        if (restaurantInfo[restaurantId]) {
            // Set about information
            restaurantAbout.innerHTML = `<p>${restaurantInfo[restaurantId].about}</p>`;

            // Set feedback information
            restaurantFeedback.innerHTML = restaurantInfo[restaurantId].feedback.map(feedback => `
                <div class="feedback-item">
                    <div class="feedback-rating">${feedback.rating}</div>
                    <div class="feedback-text">${feedback.text}</div>
                    <div class="feedback-author">- ${feedback.author}</div>
                </div>
            `).join('');
        } else {
            restaurantAbout.innerHTML = '<p>Information about this restaurant is not available.</p>';
            restaurantFeedback.innerHTML = '<p>No feedback available yet.</p>';
        }

        // Example food data for each restaurant (customize as needed)
        const foodData = {
            1: [
                { name: 'Masala Dosa', image: 'https://tse2.mm.bing.net/th?id=OIP.muoKUxPS67DJ_k3sm-wlygHaFN&pid=Api&P=0&h=180', price: 70, type: 'veg' },
                { name: 'Chicken Biryani', image: 'https://www.africanbites.com/wp-content/uploads/2018/04/IMG_0165.jpg', price: 150, type: 'nonveg' },
                { name: 'Rava Idli', image: 'https://tse4.mm.bing.net/th?id=OIP.SJ4r8E-xa-qJqquclgM4RgHaGb&pid=Api&P=0&h=180', price: 50, type: 'veg' },
                { name: 'Egg Curry', image: 'https://tse4.mm.bing.net/th?id=OIP.B0CZfLqGWwe6xds5gghnHAHaLG&pid=Api&P=0&h=180', price: 120, type: 'nonveg' },
                { name: 'Vada', image: 'https://tse4.mm.bing.net/th?id=OIP.U-byr6AmPCFWq9q6Ay10VwHaE7&pid=Api&P=0&h=180', price: 40, type: 'veg' },
                { name: 'Fish Fry', image: 'https://tse2.mm.bing.net/th?id=OIP.LDx01nvywhRgm1h1SkLINQAAAA&pid=Api&P=0&h=180', price: 180, type: 'nonveg' },
                { name: 'Paneer Butter Masala', image: 'https://tse2.mm.bing.net/th?id=OIP.3fROpInSzgY--B1msdJITQHaHa&pid=Api&P=0&h=180', price: 130, type: 'veg' },
                { name: 'Mutton Curry', image: 'https://tse4.mm.bing.net/th?id=OIP.occg_F34lY-U35Ywbgs-uQHaE7&pid=Api&P=0&h=180', price: 200, type: 'nonveg' },
                { name: 'Kesari Bath', image: 'https://tse1.mm.bing.net/th?id=OIP.QtbQ-7rtAoZE3_McQQPLngHaHE&pid=Api&P=0&h=180', price: 45, type: 'veg' },
                { name: 'Filter Coffee', image: 'https://tse1.mm.bing.net/th?id=OIP.iccf3TkxZckxuX6Y3f4cJwHaE8&pid=Api&P=0&h=180', price: 30, type: 'veg' }
            ],
            2: [
                { name: 'Crispy Masala Dosa', image: 'https://tse3.mm.bing.net/th?id=OIP.TkHv973tY0EXhYXnY9RMlQHaEK&pid=Api&P=0&h=180', price: 60, type: 'veg' },
                { name: 'Plain Dosa', image: 'https://www.indianmirchi.co.uk/wp-content/uploads/2023/09/Plain-Dosa.jpg', price: 50, type: 'veg' },
                { name: 'Idli Sambar', image: 'https://www.tomatoblues.com/wp-content/uploads/2018/07/SAMAI-IDLI-1-scaled.jpg', price: 40, type: 'veg' },
                { name: 'Chicken 65', image: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/03/chicken-65-restaurant-style.jpg', price: 140, type: 'nonveg' },
                { name: 'Vada', image: 'https://tse4.mm.bing.net/th?id=OIP.U-byr6AmPCFWq9q6Ay10VwHaE7&pid=Api&P=0&h=180', price: 35, type: 'veg' },
                { name: 'Rava Dosa', image: 'https://tse2.mm.bing.net/th?id=OIP.3RLlxQdLdSzqNS3Ak5WrTQHaJK&pid=Api&P=0&h=180', price: 55, type: 'veg' },
                { name: 'Fish Curry', image: 'https://tse4.mm.bing.net/th?id=OIP.LHbsvSjI-nPalcjKqJL0xAHaJQ&pid=Api&P=0&h=180', price: 170, type: 'nonveg' },
                { name: 'Upma', image: 'https://d36v5spmfzyapc.cloudfront.net/wp-content/uploads/2021/02/Veg-Upma-2.jpg', price: 35, type: 'veg' },
                { name: 'Puri Sagu', image: 'https://tse3.mm.bing.net/th?id=OIP.LH4eXByqmNMwljmFMZyR_wHaJ4&pid=Api&P=0&h=180', price: 60, type: 'veg' },
                { name: 'Filter Coffee', image: 'https://tse1.mm.bing.net/th?id=OIP.iccf3TkxZckxuX6Y3f4cJwHaE8&pid=Api&P=0&h=180', price: 25, type: 'veg' }
            ],
            3: [
                { name: 'Masala Dosa', image: 'https://tse2.mm.bing.net/th?id=OIP.muoKUxPS67DJ_k3sm-wlygHaFN&pid=Api&P=0&h=180', price: 70, type: 'veg' },
                { name: 'Chicken Biryani', image: 'https://www.africanbites.com/wp-content/uploads/2018/04/IMG_0165.jpg', price: 150, type: 'nonveg' },
                { name: 'Rava Idli', image: 'https://tse4.mm.bing.net/th?id=OIP.SJ4r8E-xa-qJqquclgM4RgHaGb&pid=Api&P=0&h=180', price: 50, type: 'veg' },
                { name: 'Egg Curry', image: 'https://tse4.mm.bing.net/th?id=OIP.B0CZfLqGWwe6xds5gghnHAHaLG&pid=Api&P=0&h=180', price: 120, type: 'nonveg' },
                { name: 'Vada', image: 'https://tse4.mm.bing.net/th?id=OIP.U-byr6AmPCFWq9q6Ay10VwHaE7&pid=Api&P=0&h=180', price: 40, type: 'veg' },
                { name: 'Fish Fry', image: 'https://tse2.mm.bing.net/th?id=OIP.LDx01nvywhRgm1h1SkLINQAAAA&pid=Api&P=0&h=180', price: 180, type: 'nonveg' },
                { name: 'Paneer Butter Masala', image: 'https://tse2.mm.bing.net/th?id=OIP.3fROpInSzgY--B1msdJITQHaHa&pid=Api&P=0&h=180', price: 130, type: 'veg' },
                { name: 'Mutton Curry', image: 'https://tse4.mm.bing.net/th?id=OIP.occg_F34lY-U35Ywbgs-uQHaE7&pid=Api&P=0&h=180', price: 200, type: 'nonveg' },
                { name: 'Kesari Bath', image: 'https://tse1.mm.bing.net/th?id=OIP.QtbQ-7rtAoZE3_McQQPLngHaHE&pid=Api&P=0&h=180', price: 45, type: 'veg' },
                { name: 'Filter Coffee', image: 'https://tse1.mm.bing.net/th?id=OIP.iccf3TkxZckxuX6Y3f4cJwHaE8&pid=Api&P=0&h=180', price: 30, type: 'veg' }
            ],
            4: [
                { name: 'Crispy Masala Dosa', image: 'https://tse3.mm.bing.net/th?id=OIP.TkHv973tY0EXhYXnY9RMlQHaEK&pid=Api&P=0&h=180', price: 60, type: 'veg' },
                { name: 'Plain Dosa', image: 'https://www.indianmirchi.co.uk/wp-content/uploads/2023/09/Plain-Dosa.jpg', price: 50, type: 'veg' },
                { name: 'Idli Sambar', image: 'https://www.tomatoblues.com/wp-content/uploads/2018/07/SAMAI-IDLI-1-scaled.jpg', price: 40, type: 'veg' },
                { name: 'Chicken 65', image: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/03/chicken-65-restaurant-style.jpg', price: 140, type: 'nonveg' },
                { name: 'Vada', image: 'https://tse4.mm.bing.net/th?id=OIP.U-byr6AmPCFWq9q6Ay10VwHaE7&pid=Api&P=0&h=180', price: 35, type: 'veg' },
                { name: 'Rava Dosa', image: 'https://tse2.mm.bing.net/th?id=OIP.3RLlxQdLdSzqNS3Ak5WrTQHaJK&pid=Api&P=0&h=180', price: 55, type: 'veg' },
                { name: 'Fish Curry', image: 'https://tse4.mm.bing.net/th?id=OIP.LHbsvSjI-nPalcjKqJL0xAHaJQ&pid=Api&P=0&h=180', price: 170, type: 'nonveg' },
                { name: 'Upma', image: 'https://d36v5spmfzyapc.cloudfront.net/wp-content/uploads/2021/02/Veg-Upma-2.jpg', price: 35, type: 'veg' },
                { name: 'Puri Sagu', image: 'https://tse3.mm.bing.net/th?id=OIP.LH4eXByqmNMwljmFMZyR_wHaJ4&pid=Api&P=0&h=180', price: 60, type: 'veg' },
                { name: 'Filter Coffee', image: 'https://tse1.mm.bing.net/th?id=OIP.iccf3TkxZckxuX6Y3f4cJwHaE8&pid=Api&P=0&h=180', price: 25, type: 'veg' }
            ],
            // ... Add food items for other restaurants (3-10) ...
            5: [
                { name: 'Masala Dosa', image: 'https://tse2.mm.bing.net/th?id=OIP.muoKUxPS67DJ_k3sm-wlygHaFN&pid=Api&P=0&h=180', price: 70, type: 'veg' },
                { name: 'Chicken Biryani', image: 'https://www.africanbites.com/wp-content/uploads/2018/04/IMG_0165.jpg', price: 150, type: 'nonveg' },
                { name: 'Rava Idli', image: 'https://tse4.mm.bing.net/th?id=OIP.SJ4r8E-xa-qJqquclgM4RgHaGb&pid=Api&P=0&h=180', price: 50, type: 'veg' },
                { name: 'Egg Curry', image: 'https://tse4.mm.bing.net/th?id=OIP.B0CZfLqGWwe6xds5gghnHAHaLG&pid=Api&P=0&h=180', price: 120, type: 'nonveg' },
                { name: 'Vada', image: 'https://tse4.mm.bing.net/th?id=OIP.U-byr6AmPCFWq9q6Ay10VwHaE7&pid=Api&P=0&h=180', price: 40, type: 'veg' },
                { name: 'Fish Fry', image: 'https://tse2.mm.bing.net/th?id=OIP.LDx01nvywhRgm1h1SkLINQAAAA&pid=Api&P=0&h=180', price: 180, type: 'nonveg' },
                { name: 'Paneer Butter Masala', image: 'https://tse2.mm.bing.net/th?id=OIP.3fROpInSzgY--B1msdJITQHaHa&pid=Api&P=0&h=180', price: 130, type: 'veg' },
                { name: 'Mutton Curry', image: 'https://tse4.mm.bing.net/th?id=OIP.occg_F34lY-U35Ywbgs-uQHaE7&pid=Api&P=0&h=180', price: 200, type: 'nonveg' },
                { name: 'Kesari Bath', image: 'https://tse1.mm.bing.net/th?id=OIP.QtbQ-7rtAoZE3_McQQPLngHaHE&pid=Api&P=0&h=180', price: 45, type: 'veg' },
                { name: 'Filter Coffee', image: 'https://tse1.mm.bing.net/th?id=OIP.iccf3TkxZckxuX6Y3f4cJwHaE8&pid=Api&P=0&h=180', price: 30, type: 'veg' }
            ],
            6: [
                { name: 'Crispy Masala Dosa', image: 'https://tse3.mm.bing.net/th?id=OIP.TkHv973tY0EXhYXnY9RMlQHaEK&pid=Api&P=0&h=180', price: 60, type: 'veg' },
                { name: 'Plain Dosa', image: 'https://www.indianmirchi.co.uk/wp-content/uploads/2023/09/Plain-Dosa.jpg', price: 50, type: 'veg' },
                { name: 'Idli Sambar', image: 'https://www.tomatoblues.com/wp-content/uploads/2018/07/SAMAI-IDLI-1-scaled.jpg', price: 40, type: 'veg' },
                { name: 'Chicken 65', image: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/03/chicken-65-restaurant-style.jpg', price: 140, type: 'nonveg' },
                { name: 'Vada', image: 'https://tse4.mm.bing.net/th?id=OIP.U-byr6AmPCFWq9q6Ay10VwHaE7&pid=Api&P=0&h=180', price: 35, type: 'veg' },
                { name: 'Rava Dosa', image: 'https://tse2.mm.bing.net/th?id=OIP.3RLlxQdLdSzqNS3Ak5WrTQHaJK&pid=Api&P=0&h=180', price: 55, type: 'veg' },
                { name: 'Fish Curry', image: 'https://tse4.mm.bing.net/th?id=OIP.LHbsvSjI-nPalcjKqJL0xAHaJQ&pid=Api&P=0&h=180', price: 170, type: 'nonveg' },
                { name: 'Upma', image: 'https://d36v5spmfzyapc.cloudfront.net/wp-content/uploads/2021/02/Veg-Upma-2.jpg', price: 35, type: 'veg' },
                { name: 'Puri Sagu', image: 'https://tse3.mm.bing.net/th?id=OIP.LH4eXByqmNMwljmFMZyR_wHaJ4&pid=Api&P=0&h=180', price: 60, type: 'veg' },
                { name: 'Filter Coffee', image: 'https://tse1.mm.bing.net/th?id=OIP.iccf3TkxZckxuX6Y3f4cJwHaE8&pid=Api&P=0&h=180', price: 25, type: 'veg' }
            ],
            // ... Add food items for other restaurants (3-10) ...
            // ... Add food items for other restaurants (3-10) ...
        };

        // Default food items if not defined
        const foods = foodData[restaurantId] || [
            { name: 'Sample Food 1', image: 'images/sample_food.jpg', price: 100 },
            { name: 'Sample Food 2', image: 'images/sample_food.jpg', price: 120 },
            { name: 'Sample Food 3', image: 'images/sample_food.jpg', price: 90 },
            { name: 'Sample Food 4', image: 'images/sample_food.jpg', price: 110 },
            { name: 'Sample Food 5', image: 'images/sample_food.jpg', price: 80 },
            { name: 'Sample Food 6', image: 'images/sample_food.jpg', price: 95 },
            { name: 'Sample Food 7', image: 'images/sample_food.jpg', price: 105 },
            { name: 'Sample Food 8', image: 'images/sample_food.jpg', price: 130 },
            { name: 'Sample Food 9', image: 'images/sample_food.jpg', price: 115 },
            { name: 'Sample Food 10', image: 'images/sample_food.jpg', price: 125 }
        ];

        foodGrid.innerHTML = '';
        foods.forEach(food => {
            const card = document.createElement('div');
            card.className = 'food-card';
            card.dataset.id = food.id || Math.random().toString(36).substr(2, 9);
            card.dataset.restaurantId = restaurantId;

            const img = document.createElement('img');
            img.src = food.image;
            img.alt = food.name;
            card.appendChild(img);

            // Veg/Non-Veg icon
            const nameRow = document.createElement('div');
            nameRow.style.display = 'flex';
            nameRow.style.alignItems = 'center';
            nameRow.style.gap = '8px';

            const vegIcon = document.createElement('span');
            vegIcon.style.display = 'inline-block';
            vegIcon.style.width = '14px';
            vegIcon.style.height = '14px';
            vegIcon.style.borderRadius = '50%';
            vegIcon.style.border = '2px solid #333';
            vegIcon.style.background = food.type === 'veg' ? '#2ecc40' : '#e74c3c';
            vegIcon.title = food.type === 'veg' ? 'Veg' : 'Non-Veg';
            nameRow.appendChild(vegIcon);

            const name = document.createElement('h3');
            name.className = 'food-name';
            name.textContent = food.name;
            name.style.margin = 0;
            nameRow.appendChild(name);
            card.appendChild(nameRow);

            const price = document.createElement('div');
            price.className = 'food-price';
            price.textContent = '₹' + food.price;
            card.appendChild(price);

            // Add to Cart button
            const addButton = document.createElement('button');
            addButton.className = 'add-to-cart-btn';
            addButton.textContent = 'Add to Cart';
            addButton.onclick = () => window.addToCart(card);
            card.appendChild(addButton);

            foodGrid.appendChild(card);
        });
    }

    // Handle My Orders page
    if (window.location.pathname.endsWith('my_orders.html')) {
        const cartItems = document.getElementById('cartItems');
        const totalAmount = document.getElementById('totalAmount');
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        const orderHistory = document.getElementById('orderHistory');

        // Update cart display
        function updateCart() {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            cartItems.innerHTML = '';
            let total = 0;

            if (cart.length === 0) {
                cartItems.innerHTML = '<p>Your cart is empty</p>';
                totalAmount.textContent = '₹0';
                if (placeOrderBtn) placeOrderBtn.disabled = true;
                return;
            }

            cart.forEach((item, index) => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';

                cartItem.innerHTML = `
                    <img src="${item.image || 'placeholder.jpg'}" alt="${item.foodName}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.foodName || item.name}</div>
                        <div class="cart-item-restaurant">${item.restaurantName}</div>
                        <div class="cart-item-price">₹${item.price}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                        <span>${item.quantity || 1}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                    <button class="remove-item" onclick="removeItem(${index})">×</button>
                `;

                cartItems.appendChild(cartItem);
                total += item.price * (item.quantity || 1);
            });

            if (totalAmount) {
                totalAmount.textContent = `₹${total.toFixed(2)}`;
            }
            if (placeOrderBtn) {
                placeOrderBtn.disabled = false;
            }
        }

        // Update quantity
        window.updateQuantity = function (index, change) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart[index]) {
                cart[index].quantity = (cart[index].quantity || 1) + change;
                if (cart[index].quantity < 1) {
                    cart.splice(index, 1);
                }
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCart();
            }
        };

        // Remove item
        window.removeItem = function (index) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
        };

        // Initial cart update
        updateCart();

        // Load order history
        async function loadOrderHistory() {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                orderHistory.innerHTML = '<p>Please login to view your orders</p>';
                return;
            }

            try {
                const response = await fetch(`/api/orders/user/${userId}`);
                const orders = await response.json();

                if (orders.length === 0) {
                    orderHistory.innerHTML = '<p>No previous orders found</p>';
                    return;
                }

                orderHistory.innerHTML = orders.map(order => `
                    <div class="order-card">
                        <div class="order-header">
                            <h3>Order #${order.order_id}</h3>
                            <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
                        </div>
                        <div class="order-details">
                            <p><strong>Restaurant:</strong> ${order.restaurant_name}</p>
                            <p><strong>Items:</strong> ${order.items}</p>
                            <p><strong>Total Amount:</strong> ₹${order.total_amount}</p>
                            <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                `).join('');
            } catch (error) {
                console.error('Error loading order history:', error);
                orderHistory.innerHTML = '<p>Error loading order history</p>';
            }
        }

        // Load initial order history
        loadOrderHistory();

        // Place order
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', async () => {
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    alert('Please login to place an order');
                    return;
                }

                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                if (cart.length === 0) {
                    alert('Your cart is empty');
                    return;
                }

                try {
                    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                    const response = await fetch('/api/orders', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            userId: parseInt(userId),
                            items: cart.map(item => ({
                                foodId: parseInt(item.foodId),
                                quantity: item.quantity,
                                price: item.price,
                                restaurantId: parseInt(item.restaurantId)
                            })),
                            totalAmount: totalAmount
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        alert('Order placed successfully!');
                        localStorage.removeItem('cart');
                        updateCart();
                        // Reload order history to show the new order
                        loadOrderHistory();
                    } else {
                        throw new Error(data.message || 'Failed to place order');
                    }
                } catch (error) {
                    console.error('Error placing order:', error);
                    alert(error.message || 'Failed to place order. Please try again.');
                }
            });
        }
    }

    // Dashboard protection and logout functionality
    const dashboardPages = [
        'customer_dashboard.html',
        'restaurant_dashboard.html',
        'delivery_dashboard.html'
    ];

    const currentPage = window.location.pathname.split('/').pop();
    if (dashboardPages.includes(currentPage)) {
        // Protect dashboard: redirect to login if not logged in
        if (!localStorage.getItem('userId')) {
            window.location.href = 'login.html';
        }
        // Logout button logic
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.clear();
                window.location.href = 'login.html';
            });
        }
    }

    // Restaurant Dashboard Live Chat Logic
    if (window.location.pathname.endsWith('restaurant_dashboard.html')) {
        const chatOrdersList = document.getElementById('chatOrdersList');
        let restCurrentOrderId = null;
        let restCurrentOrderItemId = null;
        let restCurrentCustomerId = null;

        // Load all order items with chats for this restaurant
        async function loadRestaurantChats() {
            const restaurantId = localStorage.getItem('userId'); // assuming userId is restaurant's id
            const res = await fetch(`http://localhost:3001/api/restaurant-chats/${restaurantId}`);
            const chats = await res.json();
            if (!Array.isArray(chats) || chats.length === 0) {
                chatOrdersList.innerHTML = '<p>No chats yet.</p>';
                return;
            }
            chatOrdersList.innerHTML = chats.map(chat => `
                <div class="chat-order-item">
                    <b>Order #${chat.order_id}</b> - ${chat.food_name} <br>
                    <span>Customer: ${chat.customer_name || chat.customer_id}</span>
                    <button class="live-chat-btn" onclick="openRestChatModal(${chat.order_id}, ${chat.order_item_id}, ${chat.customer_id})">Open Chat</button>
                </div>
            `).join('');
        }
        window.openRestChatModal = function (orderId, orderItemId, customerId) {
            restCurrentOrderId = orderId;
            restCurrentOrderItemId = orderItemId;
            restCurrentCustomerId = customerId;
            document.getElementById('restChatMessage').value = '';
            document.getElementById('restChatModal').style.display = 'block';
            loadRestChatHistory();
        };
        window.closeRestChatModal = function () {
            document.getElementById('restChatModal').style.display = 'none';
            document.getElementById('restChatHistory').innerHTML = '';
        };
        async function loadRestChatHistory() {
            const chatHistoryDiv = document.getElementById('restChatHistory');
            chatHistoryDiv.innerHTML = 'Loading...';
            const res = await fetch(`http://localhost:3001/api/livechat/${restCurrentOrderId}/${restCurrentOrderItemId}`);
            const messages = await res.json();
            chatHistoryDiv.innerHTML = messages.map(msg => `
                <div class="chat-msg ${msg.sender}">
                    <span class="chat-sender">${msg.sender === 'restaurant' ? 'You' : 'Customer'}:</span>
                    <span class="chat-text">${msg.message}</span>
                    <span class="chat-time">${new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
            `).join('');
        }
        window.sendRestChatMessage = async function () {
            const message = document.getElementById('restChatMessage').value;
            const restaurantId = localStorage.getItem('userId');
            if (!message.trim()) return alert('Please enter a message.');
            if (!restCurrentOrderId || !restCurrentOrderItemId || !restaurantId || !restCurrentCustomerId) return alert('Missing chat info.');
            const res = await fetch('http://localhost:3001/api/restaurant-reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: restCurrentOrderId,
                    orderItemId: restCurrentOrderItemId,
                    restaurantId,
                    customerId: restCurrentCustomerId,
                    message
                })
            });
            if (res.ok) {
                document.getElementById('restChatMessage').value = '';
                loadRestChatHistory();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to send message.');
            }
        };
        // Initial load
        loadRestaurantChats();
    }

    // Cart functionality
    let cart = [];

    function initializeCart() {
        const cartButton = document.createElement('div');
        cartButton.className = 'cart-button';
        cartButton.innerHTML = '<i class="fas fa-shopping-cart"></i>';
        document.body.appendChild(cartButton);

        const cartPanel = document.createElement('div');
        cartPanel.className = 'cart-panel';
        cartPanel.innerHTML = `
            <h2>Your Cart</h2>
            <div id="cart-items"></div>
            <div id="cart-total">Total: $0.00</div>
        `;
        document.body.appendChild(cartPanel);

        cartButton.addEventListener('click', () => {
            cartPanel.classList.toggle('active');
        });
    }

    function addToCart(item) {
        cart.push(item);
        updateCartDisplay();
        showNotification('Added to cart');
    }

    function updateCartDisplay() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');

        cartItems.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <span>${item.name}</span>
                <span>₹${item.price.toFixed(2)}</span>
                <button onclick="removeFromCart(${index})">Remove</button>
            `;
            cartItems.appendChild(itemElement);
            total += item.price;
        });

        cartTotal.textContent = `Total: ₹${total.toFixed(2)}`;

        // Add checkout button if cart is not empty
        if (cart.length > 0 && !document.querySelector('.checkout-btn')) {
            const checkoutBtn = document.createElement('button');
            checkoutBtn.className = 'checkout-btn';
            checkoutBtn.textContent = 'Proceed to Checkout';
            checkoutBtn.onclick = () => {
                // Save cart to localStorage before redirecting
                localStorage.setItem('cart', JSON.stringify(cart));
                window.location.href = 'my_orders.html';
            };
            cartItems.parentElement.appendChild(checkoutBtn);
        }
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCartDisplay();
    }

    // Add to cart button click handler
    document.addEventListener('click', event => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            const foodItem = event.target.closest('.food-card');
            const itemData = {
                id: foodItem.dataset.id,
                name: foodItem.querySelector('.food-name').textContent,
                price: parseFloat(foodItem.querySelector('.food-price').textContent.replace('₹', '')),
                restaurantId: localStorage.getItem('selectedRestaurantId'),
                restaurantName: localStorage.getItem('selectedRestaurantName')
            };
            addToCart(itemData);
        }
    });

    // Initialize cart when DOM is loaded
    if (window.location.pathname.endsWith('restaurant_menu.html')) {
        initializeCart();
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}); 