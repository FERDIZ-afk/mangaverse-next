import { object, string, optional, minLength, maxLength } from "valibot";

export const commentSchema = object({
  content: string([
    minLength(1, "Komentar tidak boleh kosong"),
    maxLength(1000, "Komentar terlalu panjang"),
  ]),
  mangaSlug: string([minLength(1, "Manga slug tidak boleh kosong")]),
  chapter: optional(string()),
});
