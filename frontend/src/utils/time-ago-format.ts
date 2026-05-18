export default function timeAgo(date: any): string {
        const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        
        // Define the division structure with specific Intl units
        interface Division {
            amount: number;
            name: Intl.RelativeTimeFormatUnit;
        }

        const DIVISIONS: Division[] = [
            { amount: 60, name: 'seconds' },
            { amount: 60, name: 'minutes' },
            { amount: 24, name: 'hours' },
            { amount: 7, name: 'days' },
            { amount: 4.34524, name: 'weeks' },
            { amount: 12, name: 'months' },
            { amount: Number.POSITIVE_INFINITY, name: 'years' }
        ];

        // Ensure 'date' is a timestamp for the math operation
        const time = date instanceof Date ? date.getTime() : date;
        let duration = (time - Date.now()) / 1000;

        for (const division of DIVISIONS) {
            if (Math.abs(duration) < division.amount) {
            return formatter.format(Math.round(duration), division.name);
            }
            duration /= division.amount;
        }

        return "just now"; // Fallback for safety
    }
    