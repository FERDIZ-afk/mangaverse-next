import { object, string, array, optional, minLength, maxLength } from "valibot";

export const mangaSchema = object({
  title: string([
    minLength(1, "Judul tidak boleh kosong"),
    maxLength(200, "Judul terlalu panjang"),
  ]),
  thumbnail: string([minLength(1, "Thumbnail tidak boleh kosong")]),
  meta_info: object({
    released: string(),
    author: string(),
    status: string(),
    type: string(),
    total_chapter: string(),
    updated_on: string(),
  }),
  genre: array(string()),
  synopsis: string([minLength(1, "Sinopsis tidak boleh kosong")]),
  chapters: array(
    object({
      chapter: string(),
      slug: string(),
      release: string(),
      detail_url: string(),
    })
  ),
});

export const chapterSchema = object({
  title: string([minLength(1, "Judul chapter tidak boleh kosong")]),
  images: array(string([minLength(1, "URL gambar tidak boleh kosong")])),
  chapter_number: optional(string()),
  chapter_name: optional(string()),
  next_chapter: optional(string()),
  prev_chapter: optional(string()),
});
