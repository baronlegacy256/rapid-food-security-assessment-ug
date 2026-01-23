const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://raw.githubusercontent.com/bahiirwa/uganda-APIs/master/districts_large_map.json';

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            const districtsMap = {};

            // The structure seems to be [ { districts: [...] } ]
            const districtsArray = Array.isArray(jsonData) ? jsonData[0].districts : jsonData.districts;

            if (!districtsArray) {
                console.error('Could not find districts array in response');
                process.exit(1);
            }

            districtsArray.forEach(d => {
                const subcounties = [];

                // Check if counties exist
                if (d.counties) {
                    d.counties.forEach(c => {
                        if (c.sub_counties) {
                            c.sub_counties.forEach(sc => {
                                if (sc.name) subcounties.push(sc.name);
                            });
                        }
                    });
                }
                // Sometimes subcounties might be direct children if structure varies (though example showed counties)
                // Just in case, let's stick to the observed structure.

                // Some districts names might have extra whitespace
                const districtName = d.name.trim();

                const uniqueSubcounties = [...new Set(subcounties)].filter(s => s && s.trim() !== '').sort();
                districtsMap[districtName] = uniqueSubcounties;
            });

            const fileContent = `export const districtSubcounties = ${JSON.stringify(districtsMap, null, 4)};`;

            const outputPath = path.join(__dirname, 'src', 'data', 'subcounties.js');

            // Ensure directory exists
            const dir = path.dirname(outputPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(outputPath, fileContent);
            console.log(`Successfully wrote ${Object.keys(districtsMap).length} districts to ${outputPath}`);

        } catch (error) {
            console.error('Error parsing JSON:', error.message);
        }
    });

}).on('error', (err) => {
    console.error('Error fetching data:', err.message);
});
