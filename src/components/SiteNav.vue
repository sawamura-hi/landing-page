<template>
  <nav class="site-nav">
    <div class="site-nav-inner">
      <a class="site-nav-title" href="#/kakomon">中小企業診断士</a>
      <a
        class="nav-btn"
        :class="{ current: activePanel === 'kakomon' }"
        href="#/kakomon"
      >過去問リンク集</a>
      <a
        class="nav-btn"
        :class="{ current: activePanel === 'quiz' }"
        href="#/quiz"
      >白書クイズ</a>
      <a
        class="nav-btn"
        :class="{ current: activePanel === 'library' }"
        href="#/library"
      >図書館</a>
    </div>
  </nav>
</template>

<script setup>
defineProps({ activePanel: String })
</script>

<style scoped>
.site-nav {
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}
.site-nav-inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.2em;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 52px;
}
.site-nav-title {
  color: #1a1a2e;
  font-weight: 700;
  font-size: 0.92em;
  margin-right: 16px;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
}
.nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  font-size: 0.88em;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
  font-family: inherit;
  text-decoration: none;
}
.nav-btn:hover {
  color: #1e293b;
  background: #f1f5f9;
}
.nav-btn.current {
  color: #2563eb;
  background: #eff6ff;
  font-weight: 700;
}

@media (max-width: 640px) {
  .site-nav-inner {
    padding: 0 0.8em;
    gap: 4px;
  }
  .site-nav-title {
    margin-right: 6px;
    font-size: 0.82em;
  }
  .nav-btn {
    padding: 6px 10px;
    font-size: 0.82em;
  }
}
</style>
