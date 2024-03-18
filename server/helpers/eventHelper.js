/**
 * Calculates the average rating from an array of ratings.
 * @param {Array} ratings - An array containing objects with 'rating' property.
 * @returns {number} - The average rating.
 */
const calculateAvg = (ratings) => {
    if (ratings.length === 0) {
        return 0;
    }

    const totalRating = ratings.reduce((sum, rating) => {
        return sum + rating.rating;
    }, 0);

    return totalRating / ratings.length;
};

module.exports = calculateAvg;
