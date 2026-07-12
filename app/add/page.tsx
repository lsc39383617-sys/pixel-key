"use client";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPixel, uploadImage } from "@/lib/pixel";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

export default function AddPixelPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visitedAt, setVisitedAt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 선택할 수 있습니다.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("이미지는 8MB 이하만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    try {
      setSaving(true);
      const imageUrl = imageFile ? await uploadImage(imageFile) : "";
      const pixel = await createPixel(
        name,
        description,
        imageUrl,
        visitedAt,
      );

      router.push(`/pixel/${pixel.uid}`);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "저장에 실패했습니다.";
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col p-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-5 w-fit text-sm font-medium text-stone-500"
      >
        ← 돌아가기
      </button>

      <h1 className="mb-7 text-3xl font-bold">새 Pixel 만들기</h1>

      <label className="mb-2 font-medium" htmlFor="pixel-name">
        이름
      </label>
      <input
        id="pixel-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="mb-5 rounded-xl border border-stone-200 bg-white p-3 outline-none focus:border-rose-300"
        placeholder="예: 전남대 후문"
        maxLength={60}
      />

      <label className="mb-2 font-medium" htmlFor="pixel-description">
        설명
      </label>
      <textarea
        id="pixel-description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        className="mb-5 rounded-xl border border-stone-200 bg-white p-3 outline-none focus:border-rose-300"
        rows={5}
        placeholder="여기에 추억을 적어보세요."
        maxLength={500}
      />

      <label className="mb-2 font-medium" htmlFor="visited-at">
        날짜
      </label>
      <input
        id="visited-at"
        type="date"
        value={visitedAt}
        onChange={(event) => setVisitedAt(event.target.value)}
        className="mb-5 rounded-xl border border-stone-200 bg-white p-3 outline-none focus:border-rose-300"
      />

      <label className="mb-2 font-medium" htmlFor="pixel-image">
        사진
      </label>
      <input
        id="pixel-image"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="mb-4 block w-full rounded-xl border border-stone-200 bg-white p-3 text-sm"
      />

      {preview && (
        <Image
          src={preview}
          alt="선택한 사진 미리보기"
          width={800}
          height={560}
          unoptimized
          className="mb-6 h-56 w-full rounded-2xl object-cover shadow-sm"
        />
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-xl bg-stone-900 p-4 font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "저장 중..." : "저장하기"}
      </button>
    </main>
  );
}
