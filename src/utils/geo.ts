/**
 * 地理座標関連のユーティリティ関数
 */

/**
 * Haversine公式を使用して2点間の距離を計算（km）
 * 地球を球体とみなし、2つの緯度経度座標間の最短距離（大圏距離）を計算します。
 *
 * @param lat1 地点1の緯度（度数法）
 * @param lon1 地点1の経度（度数法）
 * @param lat2 地点2の緯度（度数法）
 * @param lon2 地点2の経度（度数法）
 * @returns 2点間の距離（km）
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // 地球の半径（km）

  // 度数法からラジアンに変換
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}
