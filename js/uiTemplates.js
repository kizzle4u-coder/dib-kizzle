// Simple UI helpers with no external JSON

export function renderTemplatePicker(onSelect){
  const sel = document.createElement("select");
  sel.id = "templatePicker";

  const options = [
    { id: "kizzle",       name: "Smart DJ – Inspired by Kizzle" },
    { id: "verse-light",  name: "Verse – Light" },
    { id: "hook-dense",   name: "Hook – Dense" }
  ];

  options.forEach(t => {
    const opt = new Option(t.name, t.id);
    sel.add(opt);
  });

  sel.onchange = () => onSelect(sel.value);
  return sel;
}

export function renderSaveTemplateBtn(onSave){
  const btn = document.createElement("button");
  btn.textContent = "+ Save current";
  btn.onclick = onSave;
  return btn;
}

export function renderExportBtn(onExport){
  const btn = document.createElement("button");
  btn.textContent = "Export ⬇";
  btn.onclick = onExport;
  return btn;
}
