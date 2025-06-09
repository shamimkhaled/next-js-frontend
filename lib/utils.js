export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

export function getSpiceLevelIcon(level) {
  const icons = {
    'mild': '🌶️',
    'medium': '🌶️🌶️',
    'hot': '🌶️🌶️🌶️',
    'extra-hot': '🌶️🌶️🌶️🌶️'
  };
  return icons[level] || '';
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getDietaryTagColor(tag) {
  const colors = {
    'vegetarian': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'vegan': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'halal': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'gluten-free': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'dairy-free': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };
  return colors[tag] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
}

export function calculateDeliveryTime(preparationTime) {
  const deliveryTime = 15; // Base delivery time in minutes
  return preparationTime + deliveryTime;
}