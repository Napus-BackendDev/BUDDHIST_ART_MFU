// Match checkout eligibility before offering or adding an artwork to the cart.
export function isArtworkPurchasable(artwork, getName) {
  const status = artwork && artwork.status;
  if (!status || !status.approval || !status.sale) return false;
  if (getName('en', status.approval) !== 'Approved' || getName('en', status.sale) !== 'Available') return false;
  const lifecycle = artwork.postTermSale;
  if (!lifecycle || !lifecycle.applicable) return true;
  if (lifecycle.needsReview || !lifecycle.initialSaleEndsAt) return false;
  if (lifecycle.mode === 'display_only' && lifecycle.decision === 'display_only') return false;
  return new Date(lifecycle.initialSaleEndsAt).getTime() > Date.now() || lifecycle.decision === 'continue_sale';
}

export function isArtworkArchived(artwork, getName, now = Date.now()) {
  const lifecycle = artwork && artwork.postTermSale;
  if (!lifecycle || !lifecycle.applicable) return false;
  const approval = artwork && artwork.status && artwork.status.approval;
  const approvalName = typeof getName === 'function' ? String(getName('en', approval) || '').toLowerCase() : '';
  const approvalCode = String((approval && approval.code) || '').toUpperCase();
  const hasReservedTitle = Array.isArray(approval && approval.title)
    && approval.title.some(t => String((t && t.value) || '').toLowerCase() === 'reserved');
  if (approvalName === 'reserved' || approvalCode === 'RESERVED' || hasReservedTitle) return false;
  if (lifecycle.needsReview || !lifecycle.initialSaleEndsAt) return false;
  if (lifecycle.decision === 'continue_sale') return false;
  if (lifecycle.mode === 'display_only' && lifecycle.decision === 'display_only') return true;
  const endsAt = new Date(lifecycle.initialSaleEndsAt).getTime();
  return Number.isFinite(endsAt) && endsAt <= now;
}

export function getArtworkCohortLevel(item) {
  const level = String(item && item.courseLevel || '').trim();
  return level && level !== '00' ? level : '';
}

export function formatArtworkCohortTag(item, locale = 'th') {
  const level = getArtworkCohortLevel(item);
  if (!level) {
    return locale === 'en' ? 'Independent Artwork' : 'งานศิลปะ อิสระ';
  }
  const displayLevel = /^\d+$/.test(level) ? level.padStart(2, '0') : level;
  return locale === 'en' ? `Cohort ${displayLevel}` : `ผู้เรียนรุ่นที่ ${displayLevel}`;
}

export function getArtworkCohortRank(item) {
  const academicYear = parseInt(String(item && item.academicYear || '').trim(), 10);
  const courseLevel = parseInt(getArtworkCohortLevel(item), 10);
  if (!Number.isNaN(academicYear)) {
    return (academicYear * 1000) + (Number.isNaN(courseLevel) ? 0 : courseLevel);
  }
  if (!Number.isNaN(courseLevel)) return courseLevel;
  const date = item && (item.createdAt || (item.create && item.create.at));
  const timestamp = date ? new Date(date).getTime() : 0;
  return Number.isNaN(timestamp) ? 0 : Math.floor(timestamp / 86400000);
}

export function getArtworkTimestamp(item) {
  const date = item && (item.createdAt || (item.create && item.create.at));
  const timestamp = date ? new Date(date).getTime() : 0;
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function isLearnerArtwork(item) {
  return Boolean(item && (getArtworkCohortLevel(item) || item.submissionArtworkId || item.artworkPiece));
}

export function compareArtworksNewestCohort(a, b) {
  const learnerDiff = (isLearnerArtwork(b) ? 1 : 0) - (isLearnerArtwork(a) ? 1 : 0);
  if (learnerDiff !== 0) return learnerDiff;
  const cohortDiff = getArtworkCohortRank(b) - getArtworkCohortRank(a);
  if (cohortDiff !== 0) return cohortDiff;
  return getArtworkTimestamp(b) - getArtworkTimestamp(a);
}

const DAILY_VISIT_SEED_KEY = 'ba_home_visit_seed';

export function getDailyVisitSeed(scope = '') {
  const now = new Date();
  const dayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  let baseToken = dayKey;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      let stored = window.sessionStorage.getItem(DAILY_VISIT_SEED_KEY);
      if (!stored || !stored.startsWith(`${dayKey}:`)) {
        const nonce = Math.random().toString(36).slice(2, 10) || 'visit';
        stored = `${dayKey}:${nonce}`;
        window.sessionStorage.setItem(DAILY_VISIT_SEED_KEY, stored);
      }
      baseToken = stored;
    }
  } catch (err) {
    baseToken = dayKey;
  }
  return scope ? `${baseToken}:${scope}` : baseToken;
}

function hashSeedString(seed) {
  const str = String(seed == null ? '' : seed);
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededShuffle(items = [], seed = 'default') {
  if (!Array.isArray(items)) return [];
  const result = [...items];
  if (result.length <= 1) return result;
  let state = hashSeedString(seed) || 1;
  for (let i = result.length - 1; i > 0; i -= 1) {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    const rand = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    const j = Math.floor(rand * (i + 1));
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}

export function prioritizePurchasableWithShuffle(items = [], getName, seed = 'default') {
  if (!Array.isArray(items) || items.length === 0) return [];
  const available = [];
  const unavailable = [];
  items.forEach((item) => {
    if (isArtworkPurchasable(item, getName)) available.push(item);
    else unavailable.push(item);
  });
  return [
    ...seededShuffle(available, `${seed}:avail`),
    ...seededShuffle(unavailable, `${seed}:rest`),
  ];
}

export function selectFeaturedHomeArtworks(items = [], getName, baseSeed = 'home', limit = 4) {
  if (!Array.isArray(items) || items.length === 0) return [];
  const rankedLearners = items.filter((art) => isLearnerArtwork(art) && getArtworkCohortLevel(art));
  const topRank = rankedLearners.length > 0 ? Math.max(...rankedLearners.map(getArtworkCohortRank)) : 0;
  const topCohortPool = topRank > 0
    ? rankedLearners.filter((art) => getArtworkCohortRank(art) === topRank)
    : items.filter(isLearnerArtwork);
  const topShowcaseIds = new Set(
    prioritizePurchasableWithShuffle(topCohortPool, getName, `${baseSeed}:showcase`)
      .slice(0, 12)
      .map((art) => art && art._id)
      .filter(Boolean)
  );

  const availDistinct = [];
  const availOverlap = [];
  const restDistinct = [];
  const restOverlap = [];

  items.forEach((art) => {
    const isPurchasable = isArtworkPurchasable(art, getName);
    const inShowcase = art && art._id && topShowcaseIds.has(art._id);
    if (isPurchasable) {
      if (inShowcase) availOverlap.push(art);
      else availDistinct.push(art);
    } else if (inShowcase) {
      restOverlap.push(art);
    } else {
      restDistinct.push(art);
    }
  });

  return [
    ...seededShuffle(availDistinct, `${baseSeed}:featured:avail-d`),
    ...seededShuffle(availOverlap, `${baseSeed}:featured:avail-o`),
    ...seededShuffle(restDistinct, `${baseSeed}:featured:rest-d`),
    ...seededShuffle(restOverlap, `${baseSeed}:featured:rest-o`),
  ].slice(0, limit);
}
