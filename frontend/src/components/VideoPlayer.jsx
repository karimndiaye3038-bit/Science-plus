import { parseVideo } from '../utils/video'

export default function VideoPlayer({ url, title = 'Vidéo du cours' }) {
  const video = parseVideo(url)
  if (!video) return null

  return (
    <div className="aspect-video overflow-hidden rounded-2xl bg-black shadow-lg">
      {video.type === 'iframe' ? (
        <iframe
          src={video.src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      ) : (
        <video key={video.src} src={video.src} controls controlsList="nodownload" className="h-full w-full" />
      )}
    </div>
  )
}
