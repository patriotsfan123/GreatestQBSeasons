// Initialize Lucide icons
lucide.createIcons();

// State variables
let currentFilter = {
    search: '',
    player: 'All',
    era: 'All'
};
let selectedSeason = null;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const playerFilter = document.getElementById('playerFilter');
const eraFilter = document.getElementById('eraFilter');
const formulaToggle = document.getElementById('formulaToggle');
const formulaDetails = document.getElementById('formulaDetails');
const tableBody = document.getElementById('tableBody');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalCloseBtn = document.getElementById('modalCloseBtn');

// Initialize
function init() {
    populatePlayerFilter();
    renderTable();
    attachEventListeners();
}

// Populate player filter dropdown
function populatePlayerFilter() {
    const uniquePlayers = ['All', ...new Set(allSeasons.map(s => s.player))].sort();
    uniquePlayers.forEach(player => {
        const option = document.createElement('option');
        option.value = player;
        option.textContent = player;
        playerFilter.appendChild(option);
    });
}

// Event Listeners
function attachEventListeners() {
    searchInput.addEventListener('input', (e) => {
        currentFilter.search = e.target.value;
        renderTable();
    });

    playerFilter.addEventListener('change', (e) => {
        currentFilter.player = e.target.value;
        renderTable();
    });

    eraFilter.addEventListener('change', (e) => {
        currentFilter.era = e.target.value;
        renderTable();
    });

    formulaToggle.addEventListener('click', () => {
        formulaDetails.classList.toggle('hidden');
        formulaToggle.textContent = formulaDetails.classList.contains('hidden') 
            ? 'Show Formula Details' 
            : 'Hide Formula Details';
    });

    modalClose.addEventListener('click', closeModal);
    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// Filter seasons
function getFilteredSeasons() {
    return allSeasons.filter(season => {
        // Search filter
        const matchesSearch = season.player.toLowerCase().includes(currentFilter.search.toLowerCase()) ||
                            season.season.includes(currentFilter.search) ||
                            season.team.toLowerCase().includes(currentFilter.search.toLowerCase());
        
        // Player filter
        const matchesPlayer = currentFilter.player === 'All' || season.player === currentFilter.player;
        
        // Era filter
        const seasonYear = parseInt(season.season);
        const matchesEra = currentFilter.era === 'All' || 
                          (currentFilter.era === 'Modern (2020s)' && seasonYear >= 2020) ||
                          (currentFilter.era === '2010s' && seasonYear >= 2010 && seasonYear < 2020) ||
                          (currentFilter.era === '2000s' && seasonYear >= 2000 && seasonYear < 2010) ||
                          (currentFilter.era === '1990s' && seasonYear >= 1990 && seasonYear < 2000) ||
                          (currentFilter.era === '1980s' && seasonYear >= 1980 && seasonYear < 1990);
        
        return matchesSearch && matchesPlayer && matchesEra;
    });
}

// Get medal/award icon
function getRankIcon(rank) {
    if (rank === 1) return '<i data-lucide="medal" class="rank-icon gold"></i>';
    if (rank === 2) return '<i data-lucide="medal" class="rank-icon silver"></i>';
    if (rank === 3) return '<i data-lucide="medal" class="rank-icon bronze"></i>';
    if (rank <= 10) return '<i data-lucide="award" class="rank-icon blue"></i>';
    return '';
}

// Get row class based on MVP finish
function getRowClass(mvpFinish) {
    if (mvpFinish === '1st') return 'mvp-1st';
    if (mvpFinish === '2nd') return 'mvp-2nd';
    if (mvpFinish === '3rd' || mvpFinish.includes('~')) return 'mvp-3rd';
    return 'mvp-other';
}

// Get MVP text class
function getMvpClass(mvpFinish) {
    if (mvpFinish === '1st') return 'first';
    if (mvpFinish === '2nd') return 'second';
    return 'third';
}

// Render bonus badges
function renderBonuses(season) {
    let html = '';
    if (season.ydsLeader) html += '<span class="bonus-badge yds">YDS</span>';
    if (season.tdLeader) html += '<span class="bonus-badge td">TD</span>';
    if (season.rushYdsLeader) html += '<span class="bonus-badge rush-yds">R-YDS</span>';
    if (season.rushTdLeader) html += '<span class="bonus-badge rush-td">R-TD</span>';
    return html;
}

// Render table
function renderTable() {
    const filteredSeasons = getFilteredSeasons();
    
    tableBody.innerHTML = filteredSeasons.map(season => `
        <tr class="${getRowClass(season.mvpFinish)}" data-rank="${season.rank}">
            <td>
                <div class="rank-cell">
                    ${getRankIcon(season.rank)}
                    <span class="rank-text">#${season.rank}</span>
                </div>
            </td>
            <td><span class="score-text">${season.score.toFixed(1)}</span></td>
            <td><span class="player-text">${season.player}</span></td>
            <td><span class="season-text">${season.season}</span></td>
            <td><span class="team-text">${season.team}</span></td>
            <td><span class="mvp-text ${getMvpClass(season.mvpFinish)}">${season.mvpFinish}</span></td>
            <td><div class="bonuses-cell">${renderBonuses(season)}</div></td>
        </tr>
    `).join('');

    // Reinitialize Lucide icons for newly added elements
    lucide.createIcons();

    // Add click handlers to rows
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        row.addEventListener('click', () => {
            openModal(filteredSeasons[index]);
        });
    });
}

// Calculate bonus points
function calculateBonusPoints(season) {
    let bonus = 0;
    if (season.ydsLeader) bonus += 10;
    if (season.tdLeader) bonus += 10;
    if (season.rushYdsLeader) bonus += 5;
    if (season.rushTdLeader) bonus += 2.5;
    return bonus;
}

// Open modal
function openModal(season) {
    selectedSeason = season;
    
    document.getElementById('modalTitle').textContent = `${season.player} - ${season.season}`;
    document.getElementById('modalSubtitle').textContent = `${season.team} | MVP: ${season.mvpFinish}`;
    document.getElementById('modalTotalScore').textContent = season.score.toFixed(1);
    
    const statsGrid = document.getElementById('modalStatsGrid');
    const bonusPoints = calculateBonusPoints(season);
    
    statsGrid.innerHTML = `
        <div class="stat-card">
            <p class="stat-label">ANY/A+</p>
            <p class="stat-value">${season.anyaPlus}</p>
            <p class="stat-points">+${(season.anyaPlus / 2).toFixed(1)} pts</p>
        </div>
        <div class="stat-card">
            <p class="stat-label">Cmp%+</p>
            <p class="stat-value">${season.cmpPlus}</p>
            <p class="stat-points">+${(season.cmpPlus / 2).toFixed(1)} pts</p>
        </div>
        <div class="stat-card">
            <p class="stat-label">TD%+</p>
            <p class="stat-value">${season.tdPlus}</p>
            <p class="stat-points">+${(season.tdPlus / 2).toFixed(1)} pts</p>
        </div>
        <div class="stat-card">
            <p class="stat-label">INT%+</p>
            <p class="stat-value">${season.intPlus}</p>
            <p class="stat-points">+${(season.intPlus / 2).toFixed(1)} pts</p>
        </div>
        <div class="stat-card">
            <p class="stat-label">Rate+</p>
            <p class="stat-value">${season.ratePlus}</p>
            <p class="stat-points">+${(season.ratePlus / 2).toFixed(1)} pts</p>
        </div>
        <div class="stat-card">
            <p class="stat-label">Bonuses</p>
            <div class="stat-bonuses">
                ${season.ydsLeader ? '<span class="stat-bonus">YDS</span>' : ''}
                ${season.tdLeader ? '<span class="stat-bonus td">TD</span>' : ''}
                ${season.rushYdsLeader ? '<span class="stat-bonus rush-yds">R-YDS</span>' : ''}
                ${season.rushTdLeader ? '<span class="stat-bonus rush-td">R-TD</span>' : ''}
            </div>
            <p class="stat-points">+${bonusPoints.toFixed(1)} pts</p>
        </div>
    `;
    
    modal.classList.remove('hidden');
    lucide.createIcons();
}

// Close modal
function closeModal() {
    modal.classList.add('hidden');
    selectedSeason = null;
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}