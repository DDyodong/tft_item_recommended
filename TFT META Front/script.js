
// 소환사 검색
async function searchSummoner() {
    const input = document.getElementById('summonerInput').value.trim();
    if (!input) {
        alert('소환사 이름을 입력해주세요.');
        return;
    }
    // 닉네임#태그 형식 분리
    const [gameName, tagLine] = input.split('#');
    if (!tagLine) {
        alert('닉네임#태그 형식으로 입력해주세요. 예) Hide on bush#KR1');
        return;
    }

    // summonerinfo.html로 이동하면서 닉네임 전달
    window.location.href = `summonerinfo.html?gameName=${gameName}&tagLine=${tagLine}`;
}
   

// 페이지 로드
document.addEventListener('DOMContentLoaded', async () => {
    
});
