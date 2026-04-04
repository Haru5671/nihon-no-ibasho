"use client";

interface ShareButtonsProps {
  postId: number;
  body: string;
}

const BUTTONS = [
  {
    id: "x",
    label: "X",
    icon: (
      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    base: "text-gray-500 border-gray-200 hover:text-white hover:bg-gray-900 hover:border-gray-900",
  },
  {
    id: "threads",
    label: "Threads",
    icon: (
      <svg viewBox="0 0 192 192" className="w-3 h-3 fill-current">
        <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.452-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.741C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.194 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.068c.224 28.617 6.882 51.447 19.788 67.852 14.504 18.438 36.094 27.886 64.208 28.08h.113c24.96-.173 42.554-6.708 57.048-21.237 18.763-18.787 18.017-42.097 11.904-56.435-4.217-9.82-12.191-17.954-24.524-23.34zM98.44 129.507c-10.44.588-21.286-4.098-21.82-14.135-.397-7.442 5.296-15.746 22.461-16.735 1.966-.113 3.895-.169 5.79-.169 6.235 0 12.068.606 17.371 1.765-1.978 24.702-13.58 28.713-23.802 29.274z" />
      </svg>
    ),
    base: "text-gray-500 border-gray-200 hover:text-white hover:bg-black hover:border-black",
  },
  {
    id: "line",
    label: "LINE",
    icon: (
      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
        <path d="M19.365 9.863c.349 0 .63.285.63.63 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.07 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
      </svg>
    ),
    base: "text-[#06c755] border-[#06c755]/30 hover:text-white hover:bg-[#06c755] hover:border-[#06c755]",
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    base: "text-[#1877f2] border-[#1877f2]/30 hover:text-white hover:bg-[#1877f2] hover:border-[#1877f2]",
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    base: "text-[#e1306c] border-[#e1306c]/30 hover:text-white hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e1306c] hover:to-[#833ab4] hover:border-[#e1306c]",
  },
] as const;

export default function ShareButtons({ postId, body }: ShareButtonsProps) {
  const handleShare = (type: string) => {
    const url = `${window.location.origin}/posts/${postId}`;
    const text = `「${body.slice(0, 45)}${body.length > 45 ? "…" : ""}」 — にほんのいばしょ`;

    switch (type) {
      case "x":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank", "noopener,noreferrer,width=550,height=450"
        );
        break;
      case "threads":
        window.open(
          `https://www.threads.net/intent/post?text=${encodeURIComponent(text + "\n" + url)}`,
          "_blank", "noopener,noreferrer,width=550,height=450"
        );
        break;
      case "line":
        window.open(
          `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
          "_blank", "noopener,noreferrer"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank", "noopener,noreferrer,width=600,height=400"
        );
        break;
      case "instagram":
        if (navigator.share) {
          navigator.share({ title: "にほんのいばしょ", text, url }).catch(() => {});
        } else {
          navigator.clipboard.writeText(url).then(() => {
            alert("リンクをコピーしました。Instagramアプリで貼り付けてシェアしてください。");
          });
        }
        break;
    }
  };

  return (
    <div className="flex items-center gap-1">
      {BUTTONS.map((btn) => (
        <button
          key={btn.id}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare(btn.id); }}
          title={`${btn.label}でシェア`}
          className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold border rounded-md transition-all duration-150 ${btn.base}`}
        >
          {btn.icon}
          <span className="hidden sm:inline">{btn.label}</span>
        </button>
      ))}
    </div>
  );
}
