/**
 * De twee maten waarin geëxporteerd wordt. Story dekt Facebook én Instagram
 * (beide 9:16); post is het Instagram-feedformaat 4:5.
 */
export const FORMATS = {
  story: { key: 'story', label: 'Story 9:16', width: 1080, height: 1920 },
  post: { key: 'post', label: 'Post 4:5', width: 1080, height: 1350 },
}

export const FORMAT_LIST = [FORMATS.story, FORMATS.post]
