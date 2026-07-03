"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPixel, uploadImage } from "@/lib/pixel";

export default function AddPixelPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    try {
      setSaving(true);

      let imageUrl = "";

      if (file) {
        imageUrl = await uploadImage(file);
      }

      const pixel = await createPixel(
        name,
        description,
        imageUrl,
      );

      router.push(`/pixel/${pixel.uid}`);
    } catch (e) {
      console.error(e);
      alert("저장 실패");
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
        className="mb-5 rounded-lg border p-3"
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
          const selected = e.target.files?.[0];

          if (!selected) return;

          setFile(selected);
          setPreview(URL.createObjectURL(selected));
        }}
        className="mb-4"
      />

      {preview && (
        <img
          src={preview}
          alt="preview"
          className="mb-6 h-52 w-full rounded-xl object-cover"
        />
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-xl bg-black p-4 text-white"
      >
        {saving ? "저장중..." : "저장하기"}
      </button>

    </main>
  );
}