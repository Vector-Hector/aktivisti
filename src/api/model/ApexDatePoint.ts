export interface ApexDatePoint {
  // The x will be our days
  x: string
  // The y will be our count
  y: number | null
}

const _MS_PER_DAY = 1000 * 60 * 60 * 24

export class ApexDataUtil {
  /**
   * Fills missing ApexDataPoints with 0
   *
   * If for one day a value is undefined/missing, this function creates an entry
   * for this day with value '0'.
   *
   * @param apexDataPoints - The array of ApexDatePoints, that should be observed for missing values.
   * @param startDate - The starting point from which to start filling missing values.
   * @param endDate - The end point up to which missing value should be filled in.
   */
  static fillMissingDataPoints(
    apexDataPoints: ApexDatePoint[],
    startDate: Date,
    endDate: Date
  ) {
    const filledDataPoints: Array<ApexDatePoint> = []
    const diffDays = dateDiffInDays(startDate, endDate)
    for (let i = 0; i <= diffDays; i++) {
      const currDate = new Date(startDate)
      currDate.setDate(currDate.getDate() + i)
      const currDayString = `${currDate.getFullYear()}-${(
        '0' + String(currDate.getMonth() + 1)
      ).slice(-2)}-${('0' + String(currDate.getDate())).slice(-2)}`
      const currDateDataPoint = apexDataPoints.find(
        (dataPoint) => dataPoint.x === currDayString
      )
      if (currDateDataPoint) {
        filledDataPoints.push(currDateDataPoint)
      } else {
        filledDataPoints.push({
          x: currDayString,
          y: 0
        })
      }
    }
    return filledDataPoints
  }
}

/**
 * Counts the days between a and b
 */
function dateDiffInDays(a: Date, b: Date) {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())

  return Math.floor((utc2 - utc1) / _MS_PER_DAY)
}
