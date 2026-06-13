const Order = require('../../Order/controller/order');
const Artwork = require('../../Artwork/controller/artwork');
const User = require('../../User/controller/user');
const ResMessage = require("../../Settings/service/message");

exports.onGetStats = async function (request, response) {
    try {
        const artworks = await Artwork.onQuerys({});
        const users = await User.onQuerys({});
        const orders = await Order.onQuerys({});

        // 1. Calculate Summary
        const summary = {
            artworks: artworks ? artworks.length : 0,
            users: users ? users.length : 0,
            orders: orders ? orders.length : 0
        };

        // 2. Calculate Chart Data for Artwork Status
        const statusCount = {};
        if (artworks) {
            artworks.forEach(art => {
                let statusName = 'Pending';
                
                // Extract status based on typical patterns in this project
                if (art.status) {
                    const statusObj = art.status.approval || art.status;
                    if (statusObj && statusObj.title) {
                        const title = statusObj.title;
                        if (Array.isArray(title)) {
                            const en = title.find(t => t.key === 'en');
                            if (en) statusName = en.value;
                        } else if (typeof title === 'string') {
                            statusName = title;
                        }
                    }
                }
                
                statusCount[statusName] = (statusCount[statusName] || 0) + 1;
            });
        }
        const statusCharts = Object.keys(statusCount).map(k => ({ _id: k, count: statusCount[k] }));

        // 3. Calculate Chart Data for Artwork Category
        const categoryCount = {};
        if (artworks) {
            artworks.forEach(art => {
                let catName = 'Unknown';
                if (art.category && art.category.title) {
                    const title = art.category.title;
                    if (Array.isArray(title)) {
                        const en = title.find(t => t.key === 'en');
                        if (en) catName = en.value;
                    } else if (typeof title === 'string') {
                        catName = title;
                    }
                }
                categoryCount[catName] = (categoryCount[catName] || 0) + 1;
            });
        }
        const categoryCharts = Object.keys(categoryCount).map(k => ({ _id: k, count: categoryCount[k] }));

        // 4. Calculate Order Analytics
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentDate = now.getDate();

        const orderAnalytics = {
            year: new Array(12).fill(0),
            month: new Array(31).fill(0),
            day: new Array(24).fill(0)
        };

        if (orders) {
            orders.forEach(order => {
                const date = order.createdAt ? new Date(order.createdAt) : null;
                if (!date) return;

                const orderYear = date.getFullYear();
                const orderMonth = date.getMonth();
                const orderDate = date.getDate();
                const orderHour = date.getHours();

                // 4.1 Year (Orders per month in current year)
                if (orderYear === currentYear) {
                    orderAnalytics.year[orderMonth] += 1;
                }

                // 4.2 Month (Orders per day in current month)
                if (orderYear === currentYear && orderMonth === currentMonth) {
                    // Day of month is 1-indexed (1-31), array is 0-indexed (0-30)
                    orderAnalytics.month[orderDate - 1] += 1;
                }

                // 4.3 Day (Orders per hour today)
                if (orderYear === currentYear && orderMonth === currentMonth && orderDate === currentDate) {
                    orderAnalytics.day[orderHour] += 1;
                }
            });
        }

        // 5. Get Pending Artworks (Max 5)
        let pendingArtworks = [];
        if (artworks) {
            pendingArtworks = artworks.filter(art => {
                if (!art.status) return false;
                const statusObj = art.status.approval || art.status;
                if (!statusObj || !statusObj.title) return false;
                
                const title = statusObj.title;
                if (Array.isArray(title)) {
                    const en = title.find(t => t.key === 'en');
                    return en && (en.value === 'Pending' || en.value === 'รอการตรวจสอบ' || en.value === 'รออนุมัติ');
                } else if (typeof title === 'string') {
                    return title === 'Pending' || title === 'รอการตรวจสอบ' || title === 'รออนุมัติ';
                }
                return false;
            }).slice(0, 5); // get only first 5
        }

        // Construct final document
        const doc = {
            summary,
            charts: {
                status: statusCharts,
                category: categoryCharts,
                orderAnalytics: orderAnalytics
            },
            pendingArtworks
        };

        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.error("Dashboard error:", err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};
