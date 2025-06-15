// lib/settingsApi.js - API functions for settings
export async function getSettings() {
  try {
    const response = await fetch('https://seashell-app-4gkvz.ondigitalocean.app/api/settings/', {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    
    // Return fallback settings if API fails
    return {
      site_name: "FoodHub",
      tagline: "Delicious Food Delivered Fresh",
      logo: null,
      logo_dark: null,
      favicon: null,
      email: "order@foodhub.com",
      phone: "+1 (555) 123-FOOD",
      address: "123 Culinary Street, Food City, FC 12345",
      facebook: "https://facebook.com/foodhub",
      twitter: "",
      instagram: "https://instagram.com/foodhub",
      linkedin: "",
      youtube: "",
      meta_description: "Order fresh, delicious food online with customizable spice levels and toppings",
      meta_keywords: "",
      google_analytics_id: "",
      primary_color: "C63212",
      secondary_color: "eee412",
      font_family: "Inter",
      footer_text: "FoodHub - Your favorite food, delivered fresh",
      copyright_text: "© 2024 FoodHub. All rights reserved.",
      privacy_policy: "",
      terms_conditions: "",
      return_policy: "",
    };
  }
}