"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPixel, uploadImage } from "@/lib/pixel";

export default function AddPixelPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  async function handleSave() {

  if (!name.trim()) {
    alert("이름을 입력해주세요.");
    return;
  }

  try {
    setSaving(true);

    let imageUrl = "";

    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const pixel = await createPixel(
      name,
      description,
      imageUrl
    );

    router.push(`/pixel/${pixel.uid}`);
  } catch (e: any) {
    console.error(e);
  
    alert(
      e?.message ??
      JSON.stringify(e) ??
      "저장 실패"
    );
  } finally {
    setSaving(false);
  }
}

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col p-6">
      <h1 className="mb-6 text-3xl font-bold">
        새 Pixel 만들기
      </h1>

      <label className="mb-2 font-medium">
        이름
      </label>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-5 rounded-lg border p-3"
        placeholder="예: 전남대 후문"
      />

      <label className="mb-2 font-medium">
        설명
      </label>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-8 rounded-lg border p-3"
        rows={5}
        placeholder="여기에 추억을 적어보세요."
      />
<label className="mb-2 font-medium">
  사진
</label>

<input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }}
  className="mb-4 block w-full rounded-xl border p-3"
/>

{preview && (
  <img
    src={preview}
    alt="preview"
    className="mb-6 h-56 w-full rounded-2xl object-cover shadow"
  />
)}
<button
  type="button"
  onClick={handleSave}
  disabled={saving}
  className="rounded-xl bg-black p-4 text-white disabled:opacity-50"
>
  {saving ? "저장중..." : "저장하기"}
</button>
    </main>
  );
}