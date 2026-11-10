let timer: ReturnType<typeof setTimeout>;

export async function copyText(text: string) {
  let success = false;
  try {
    if (!navigator.clipboard || !window.isSecureContext) throw new Error('Use fallback');
    await navigator.clipboard.writeText(text);
    success = true;
  } catch {
    const previous = document.activeElement as HTMLElement | null;
    const field = document.createElement('textarea');
    field.value = text;
    field.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.append(field);
    field.select();
    try { success = document.execCommand('copy'); } catch { /* Show manual-copy hint. */ }
    field.remove();
    previous?.focus({ preventScroll: true });
  }
  const toast = document.querySelector<HTMLElement>('.toast');
  if (!toast) return;
  clearTimeout(timer);
  toast.textContent = success ? '已复制到剪贴板' : '请选中内容手动复制';
  timer = setTimeout(() => { toast.textContent = ''; }, 2400);
}
