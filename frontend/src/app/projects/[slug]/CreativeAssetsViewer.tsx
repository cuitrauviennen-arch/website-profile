"use client";

import { useState } from "react";
import "./projectDetail.css";

const mediaUrl = (m: any) =>
  m?.url ? (m.url.startsWith("http") ? m.url : `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337"}${m.url}`) : null;

export default function CreativeAssetsViewer({ assets }: { assets: any[] }) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  return (
    <>
      <div className="pd-ca">
        {assets.map((a: any, i: number) => {
          const imgUrl = mediaUrl(a.image);
          return (
            <a
              className={`pd-ca-item pd-reveal${a.size === "tall" ? " pd-tall" : ""}`}
              data-d={i % 3}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (imgUrl) {
                  setActiveImage(imgUrl);
                }
              }}
              key={i}
            >
              {imgUrl ? (
                <img src={imgUrl} alt={a.name} />
              ) : (
                <div className="pd-ph" data-label={a.imageLabel || a.name} />
              )}
              <div className="pd-ca-body">
                <div className="pd-ca-cat">{a.category}</div>
                <div className="pd-ca-name">{a.name}</div>
                <div className="pd-ca-rev">
                  <div>
                    <p>{a.description}</p>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {activeImage && (
        <div
          className="pd-modal-overlay"
          onClick={() => setActiveImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            cursor: "zoom-out",
          }}
        >
          <div
            className="pd-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={activeImage}
              alt="Full size"
              style={{
                maxWidth: "100%",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              }}
            />
            <button
              onClick={() => setActiveImage(null)}
              style={{
                position: "absolute",
                top: "-40px",
                right: "0px",
                background: "none",
                border: "none",
                color: "white",
                fontSize: "2rem",
                cursor: "pointer",
                padding: "8px",
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
