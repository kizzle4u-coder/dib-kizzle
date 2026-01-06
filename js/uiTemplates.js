export function renderTemplatePicker(onSelect) {
  const sel = document.createElement("select");
  sel.id = "templatePicker";

  const opt = new Option("Smart DJ – Inspired by Kizzle", "default");
  sel.add(opt);

  sel.onchange = () => onSelect(sel.value);
  return sel;
}

export function renderSaveTemplateBtn(onSave) {
  const btn = document.createElement("button");
  btn.textContent = "+ Save current";
  btn.onclick = onSave;
  return btn;
}

export function renderExportBtn(onExport) {
  const btn = document.createElement("button");
  btn.textContent = "Export ⬇";
  btn.onclick = onExport;
  return btn;
}
