module.exports = function (config) {
    // console.log('a1a273539c integration ran');
    // console.log('with this config file: \n' + JSON.stringify(config));

    var perf = {
        url: window.location.href,
        evolvExecutionStart: performance.now()
    };
    evolv.context.set('vz.performance', perf);

    // set the visitor ID
    // ==================
    // alloy() is an Adobe AEP async function returning a promise
    //
    waitFor(() => window.alloy)
    .then(alloy => {
        alloy('getIdentity').then(function (result) {
            // console.log('result:', result);
            // console.log('result ECID:', result.identity.ECID);
            // console.log('result RegionId:', result.edge.regionId);
            evolv.context.set('vzOmni.visitorId', result.identity.ECID);
        }).catch(() => {
            // nothing
        });
    })
    .catch(() => {
        // console.warn('window.alloy not set within timeout');
    });

    // set the time since last visit
    // =============================
    //     there are 6 buckets
    //         new visitor
    //         Less than an hour ago
    //         Less than a day ago
    //         Less than a week ago
    //         Less than 30 days ago
    //         More than 30 days ago
    //
    waitFor(() => window.vzdl?.utils?.lastVisit, 10000)
    .then(lastVisit => {
        var lastVisitBucket;
        if (lastVisit == 'New Visitor') {
            lastVisitBucket = 'New visitor';
        }
        var lastVisitInSec = convertToSeconds(lastVisit);
        if (lastVisitInSec < 3600) {
            lastVisitBucket = 'Less than an hour ago';
        } else if (lastVisitInSec < 86400) {
            lastVisitBucket = 'Less than a day ago';
        } else if (lastVisitInSec < 604800) {
            lastVisitBucket = 'Less than a week ago';
        } else if (lastVisitInSec < 2592000) {
            lastVisitBucket = 'Less than 30 days ago';
        } else {
            lastVisitBucket = 'More than 30 days ago';
        }
        evolv.context.set('vz.lastVisitBucket', lastVisitBucket);
    })
    .catch(() => {
        // console.warn('window.vzdl.utils.lastVisit not set within timeout');
    });

    // set visit start
    // ===============
    //     weekday
    //     6h day part
    //         Early Morning            Midnight - 6:00 AM
    //         Morning to Afternoon     6:00 AM - 12:00 PM
    //         Afternoon to Evening     12:00 PM - 6:00 PM
    //         Evening to Late Night    6:00 PM - Midnight
    //
    // example string to parse: "year=2023 | month=July | date=12 | day=Wednesday | time=11:02 PM"
    //
    waitFor(() => window.vzdl?.utils?.visitStart, 10000)
    .then(visitStart => {
        let components = visitStart.split(' | ');

        // find the component that starts with 'day='
        let dayComponent = components.find(component => component.startsWith('day='));

        if (dayComponent) {
            // split the day component by '=' to get the day of the week
            let dayOfWeek = dayComponent.split('=')[1];
            evolv.context.set('vz.dayOfWeek', dayOfWeek);
        }

        let timeComponent = components.find(component => component.startsWith('time='));
        if (timeComponent) {
            let timeValue = timeComponent.split('=')[1];

            // Convert the time string to a Date object
            let date = new Date(`1/1/1970 ${timeValue}`);

            // Get the hour
            let hour = date.getHours();

            // Determine the part of the day
            let partOfDay;
            if (hour >= 0 && hour < 6) {
                partOfDay = 'Early Morning';
            } else if (hour >= 6 && hour < 12) {
                partOfDay = 'Morning to Afternoon';
            } else if (hour >= 12 && hour < 18) {
                partOfDay = 'Afternoon to Evening';
            } else {
                partOfDay = 'Evening to Late Night';
            }

            evolv.context.set('vz.partOfDay', partOfDay);
        }
    })
    .catch(() => {
        // console.warn('window.vzdl.utils.dayOfWeek not set within timeout');
    });

    // set billing state, OS, upgrade eligibility and age bucket of the customer
    // =========================================================================
    //     billing state: Two letter state abbreviation
    //     OS: Could be any string, but is generally "Apple iOS" or "Android", it's null on flip phones
    //     upgrade eligibility: true or false
    //     age bucket: Converted from anonymous age buckets to age ranges
    //
    //     these data attributes are set at as children of the vzdl evolv object for the account owner
    
    // UAD or MDN selection pages
    if (location.href == 'https://www.verizon.com/digital/nsa/secure/ui/udb/#/' 
            || location.href == 'https://www.verizon.com/sales/nextgen/mdnselection.html?mtnFlow=M&fromGnav=true' ) {
        waitFor(() => window.vzdl?.park?.evolv, 10000)
        .then(evolvNode => {
            if (evolvNode.billingState) {
                evolv.context.set('vz.billingState', evolvNode.billingState);
            }
            if (evolvNode.lines) {
                const linesArray = evolvNode.lines;
                let selectedLine = linesArray.find(line =>
                    line.accessRole && line.accessRole === 'Owner'
                );
                if (!selectedLine) {
                    selectedLine = linesArray.find(line =>
                        line.accessRole && line.accessRole === 'Manager'
                    );
                }
                // If a qualifying line is found, set the line-specific context values
                if (selectedLine) {
                    evolv.context.set('vz.accessRole', selectedLine.accessRole);
                    evolv.context.set('vz.isByodDevice', selectedLine.byodDevice);
                    evolv.context.set('vz.deviceCategory', selectedLine.category);
                    evolv.context.set('vz.deviceAge', deviceAge(selectedLine.devicePurchaseDate));
                    evolv.context.set('vz.deviceDescription', selectedLine.displayName);
                    evolv.context.set('vz.deviceOperatingSystem', selectedLine.operatingSystem);
                    evolv.context.set('vz.isUpgradeEligible', selectedLine.upgradeEligible);
                    evolv.context.set('vz.deviceCount', linesArray.length);
                }
            }
            if (evolvNode.userAgeBucket) {
                evolv.context.set('vz.userAgeBucket', userAgeBucket(evolvNode.userAgeBucket));
            }
        })
        .catch(() => {
            // console.warn('Data attibs not set within timeout');
        });
    }

    // Support functions
    // =================

    function waitFor(callback, timeout = 5000, interval = 25) {
        return new Promise((resolve, reject) => {
            let poll;
            const timer = setTimeout(() => {
                clearInterval(poll);
                reject();
            }, timeout);
            poll = setInterval(() => {
                const result = callback();
                if (result) {
                    clearInterval(poll);
                    clearTimeout(timer);
                    resolve(result);
                }
            }, interval);
        });
    }

    function convertToSeconds(durationString) {
        const units = durationString.split(' ');
        const value = parseFloat(units[0]);
        const period = units[1];

        switch (period) {
            case 'seconds':
            case 'second':
                return Math.floor(value);
            case 'minutes':
            case 'minute':
                return Math.floor(value * 60);
            case 'hours':
            case 'hour':
                return Math.floor(value * 60 * 60);
            case 'days':
            case 'day':
                return Math.floor(value * 60 * 60 * 24);
            default:
                return null;
        }
    }

    // set the customer's age bucket
    // ====================================================
    //     there are 8 buckets
    //         <18 years   (AgeLevel1)
    //         18-24 years (AgeLevel2)
    //         25-34 years (AgeLevel3)
    //         35-44 years (AgeLevel4)
    //         45-54 years (AgeLevel5)
    //         55-64 years (AgeLevel6)
    //         >65 years   (AgeLevel7)
    //         unknown     (Undefined)
    //
    function userAgeBucket(vzUserAgeBucket) {
        var userAgeBucket = 'Invalid age level';

        switch (vzUserAgeBucket) {
            case 'AgeLevel1':
                userAgeBucket = '<18 years';
                break;
            case 'AgeLevel2':
                userAgeBucket = '18-24 years';
                break;
            case 'AgeLevel3':
                userAgeBucket = '25-34 years';
                break;
            case 'AgeLevel4':
                userAgeBucket = '35-44 years';
                break;
            case 'AgeLevel5':
                userAgeBucket = '45-54 years';
                break;
            case 'AgeLevel6':
                userAgeBucket = '55-64 years';
                break;
            case 'AgeLevel7':
                userAgeBucket = '>65 years';
                break;
            case 'Undefined':
                userAgeBucket = 'unknown';
                break;
        }
        return userAgeBucket;
    }

    // set the device age
    // ====================================================
    //     there are x buckets
    //         <18 years   (AgeLevel1)
    //         18-24 years (AgeLevel2)
    //         25-34 years (AgeLevel3)
    //         35-44 years (AgeLevel4)
    //         45-54 years (AgeLevel5)
    //         55-64 years (AgeLevel6)
    //         >65 years   (AgeLevel7)
    //         unknown     (Undefined)
    function deviceAge(dateStr) {
        // Expecting dateStr in "mm/dd/yyyy" format.
        const parts = dateStr.split('/');
        if (parts.length !== 3) {
          return "Invalid date";
        }
        
        // In "mm/dd/yyyy", the first part is the month, second is the day, third is the year.
        const month = parseInt(parts[0], 10);
        const day = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        
        // Validate the parsed numbers.
        if (isNaN(month) || isNaN(day) || isNaN(year)) {
          return "Invalid date";
        }
        
        // Create a Date object (JavaScript months are 0-indexed).
        const inputDate = new Date(year, month - 1, day);
        
        // Validate that the constructed date matches the input values (to catch invalid dates like "02/31/2025").
        if (
          inputDate.getFullYear() !== year ||
          inputDate.getMonth() !== month - 1 ||
          inputDate.getDate() !== day
        ) {
          return "Invalid date";
        }
        
        // Normalize the input date to midnight.
        inputDate.setHours(0, 0, 0, 0);
        
        // Get today's date and normalize to midnight.
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Compute tomorrow's date by adding one day to today.
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Reject dates that are in the future (beyond tomorrow).
        if (inputDate.getTime() > tomorrow.getTime()) {
          return "Invalid date: date is in the future";
        }
        
        // If the input date is either today or tomorrow, it falls in the "today" bucket.
        if (inputDate.getTime() === today.getTime() || inputDate.getTime() === tomorrow.getTime()) {
          return "today";
        }
        
        // For past dates, calculate the difference in days.
        const msPerDay = 1000 * 60 * 60 * 24;
        const deltaDays = Math.floor((today - inputDate) / msPerDay);
        
        // Assign the appropriate bucket.
        if (deltaDays <= 7) {
          return "<= 1 week";
        } else if (deltaDays <= 31) {
          return "<= 1 mo";
        } else if (deltaDays < 365) {
          return "<= 1 year";
        } else if (deltaDays < 365 * 2) {
          return "<= 2 years";
        } else if (deltaDays < 365 * 3) {
          return "<= 3 years";
        } else {
          return "> 3 years";
        }
    }
};