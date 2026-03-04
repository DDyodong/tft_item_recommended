const TFTData = {
    champions: {},
    items: {},
    version: null,

    async init() {
        this.version = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
            .then(r => r.json()).then(v => v[0]);
        
        await Promise.all([
            this.loadChampions(),
            this.loadItems()
        ]);
    },

    async loadChampions() {
        const res = await fetch(
            `https://ddragon.leagueoflegends.com/cdn/${this.version}/data/ko_KR/tft-champion.json`
        );
        const data = await res.json();
        this.champions = data.data;
    },

    async loadItems() {
        const res = await fetch(
            `https://ddragon.leagueoflegends.com/cdn/${this.version}/data/ko_KR/tft-item.json`
        );
        const data = await res.json();
        this.items = data.data;
    }
};