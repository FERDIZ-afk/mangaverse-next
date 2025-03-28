"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button, Input } from "@/components/ui/";
import { Send, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CommentSection({ mangaSlug, chapter = null }) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        let url = `/api/comments?slug=${mangaSlug}`;
        if (chapter) {
          url += `&chapter=${chapter}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Gagal mengambil komentar");
        }

        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setError("Gagal memuat komentar");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [mangaSlug, chapter]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Buat objek data komentar
      const commentData = {
        content: commentText.trim(),
        mangaSlug: mangaSlug,
      };

      // Hanya tambahkan chapter jika tidak null dan tidak empty string
      if (chapter) {
        commentData.chapter = chapter;
      }

      console.log("Sending comment data:", commentData);

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengirim komentar");
      }

      // Tambahkan komentar baru ke daftar
      setComments([data, ...comments]);
      setCommentText("");
    } catch (error) {
      console.error("Error posting comment:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mt-8">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center">
        <MessageSquare className="mr-2 text-purple-400" />
        Komentar
      </h2>

      {/* Form komentar */}
      {status === "authenticated" ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={session.user.image || "/waguri.jpg"}
                alt={session.user.name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-grow">
              <div className="mb-2 text-sm text-gray-300">
                Berkomentar sebagai{" "}
                <span className="font-medium text-purple-400">
                  {session.user.name}
                </span>
              </div>
              <div className="relative">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Tulis komentar..."
                  className="w-full bg-gray-700 border-gray-600 text-white pr-12"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="absolute right-1 top-1 h-8 w-10 p-0 bg-purple-600 hover:bg-purple-700"
                >
                  <Send size={16} />
                </Button>
              </div>
              {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-700 rounded-lg p-4 mb-6 text-center">
          <p className="text-gray-300 mb-2">
            Silakan login untuk meninggalkan komentar
          </p>
          <Link href="/login">
            <Button className="bg-purple-600 hover:bg-purple-700">Login</Button>
          </Link>
        </div>
      )}

      {/* Daftar komentar */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-400">Memuat komentar...</p>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={comment.user.image || "/waguri.jpg"}
                    alt={comment.user.name}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-white">
                      {comment.user.name}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm whitespace-pre-line">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400">
              Belum ada komentar. Jadilah yang pertama berkomentar!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
