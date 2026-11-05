(() => {
  const durations = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
  const names = { focus: '专注', short: '短休息', long: '长休息' };
  const $ = id => document.getElementById(id);
  let mode = 'focus', remaining = durations[mode], end = null, timer = null;
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; };
  function readCount() { try { const v = JSON.parse(localStorage.getItem('focus-timer-count') || '{}'); return v.date === today() && Number.isInteger(v.count) ? v.count : 0; } catch { return 0; } }
  function saveCount(n) { try { localStorage.setItem('focus-timer-count', JSON.stringify({date: today(), count: n})); } catch {} }
  function render() {
    $('time').textContent = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
    document.title = `${$('time').textContent} · ${names[mode]} | 专注时刻`;
    $('bar').style.width = `${(1 - remaining / durations[mode]) * 100}%`;
    $('toggle').textContent = end ? '暂停' : remaining === durations[mode] ? `开始${names[mode]}` : '继续';
    $('count').textContent = readCount();
  }
  function stop() { clearInterval(timer); timer = null; end = null; }
  function tick() {
    if (!end) return;
    remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    if (!remaining) { stop(); if (mode === 'focus') saveCount(readCount() + 1); $('status').textContent = mode === 'focus' ? '完成一次专注，休息一下吧！' : '休息结束，准备好继续了吗？'; }
    render();
  }
  $('toggle').addEventListener('click', () => {
    if (end) { tick(); if (end) { stop(); $('status').textContent = '已暂停，随时可以继续。'; } }
    else { if (!remaining) remaining = durations[mode]; end = Date.now() + remaining * 1000; $('status').textContent = mode === 'focus' ? '专注当下，你做得很好。' : '放松一下，给自己充电。'; timer = setInterval(tick, 250); }
    render();
  });
  $('reset').addEventListener('click', () => { stop(); remaining = durations[mode]; $('status').textContent = '准备好开始了吗？'; render(); });
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => { stop(); mode = button.dataset.mode; remaining = durations[mode]; document.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('selected', b === button)); $('status').textContent = '准备好开始了吗？'; render(); }));
  $('clear').addEventListener('click', () => { if (confirm('确定清除今天的专注记录吗？')) { saveCount(0); render(); } });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { tick(); render(); } });
  render();
})();
