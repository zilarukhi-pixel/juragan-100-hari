import Time "mo:core/Time";
import Common "../types/common";

module {
  /// Convert a nanosecond timestamp into a YYYYMMDD day key (UTC).
  public func dayKeyOf(timestamp : Common.Timestamp) : Common.DayKey {
    let seconds = timestamp / 1_000_000_000;
    let days = seconds / 86_400;
    civilFromDays(days);
  };

  /// The current UTC day as a YYYYMMDD key.
  public func today() : Common.DayKey {
    dayKeyOf(Time.now());
  };

  /// Convert a day count since the Unix epoch into YYYYMMDD.
  func civilFromDays(z0 : Int) : Nat {
    let z = z0 + 719_468;
    let era = (if (z >= 0) z else z - 146_096) / 146_097;
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1_460 + doe / 36_524 - doe / 146_096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if (mp < 10) mp + 3 else mp - 9;
    let year = if (m <= 2) y + 1 else y;
    year.toNat() * 10_000 + m.toNat() * 100 + d.toNat();
  };
};
