import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Common "../types/common";
import Types "../types/challenge";
import GameTypes "../types/game";

module {
  /// Create the caller's 100-day challenge with a target and start day.
  public func startChallenge(
    challenges : Map.Map<Principal, Types.Challenge>,
    caller : Principal,
    target : Nat,
    startDay : Common.DayKey,
    now : Common.Timestamp,
  ) : Types.Challenge {
    let challenge : Types.Challenge = {
      target = target;
      startDay = startDay;
      createdAt = now;
    };
    challenges.add(caller, challenge);
    challenge;
  };

  /// Return the caller's challenge configuration, if started.
  public func getChallenge(
    challenges : Map.Map<Principal, Types.Challenge>,
    caller : Principal,
  ) : ?Types.Challenge {
    challenges.get(caller);
  };

  /// Record or update the caller's sales for a given day.
  public func recordSales(
    entries : Map.Map<Principal, Map.Map<Nat, Types.SalesEntry>>,
    caller : Principal,
    day : Common.DayKey,
    quantity : Nat,
    platform : Common.Platform,
    now : Common.Timestamp,
  ) : Types.SalesEntry {
    let byDay = switch (entries.get(caller)) {
      case (?m) m;
      case null {
        let m = Map.empty<Nat, Types.SalesEntry>();
        entries.add(caller, m);
        m;
      };
    };
    let entry : Types.SalesEntry = {
      day = day;
      quantity = quantity;
      platform = platform;
      updatedAt = now;
    };
    byDay.add(day, entry);
    entry;
  };

  /// Return the caller's sales history, newest first, optionally filtered by
  /// platform and an inclusive day range.
  public func listSales(
    entries : Map.Map<Principal, Map.Map<Nat, Types.SalesEntry>>,
    caller : Principal,
    platform : ?Common.Platform,
    fromDay : ?Common.DayKey,
    toDay : ?Common.DayKey,
  ) : [Types.SalesEntry] {
    let byDay = switch (entries.get(caller)) {
      case (?m) m;
      case null Map.empty<Nat, Types.SalesEntry>();
    };
    byDay.values()
      .filter(func e {
        let platformOk = switch (platform) { case (?p) e.platform == p; case null true };
        let fromOk = switch (fromDay) { case (?d) e.day >= d; case null true };
        let toOk = switch (toDay) { case (?d) e.day <= d; case null true };
        platformOk and fromOk and toOk;
      })
      .toArray()
      .sort(func (a, b) = if (a.day > b.day) #less else if (a.day < b.day) #greater else #equal);
  };

  /// Compute the caller's aggregate challenge progress.
  public func getProgress(
    challenges : Map.Map<Principal, Types.Challenge>,
    entries : Map.Map<Principal, Map.Map<Nat, Types.SalesEntry>>,
    quizResults : Map.Map<Principal, Map.Map<Nat, GameTypes.QuizResult>>,
    caller : Principal,
    today : Common.DayKey,
  ) : ?Types.ChallengeProgress {
    switch (challenges.get(caller)) {
      case null null;
      case (?challenge) {
        let byDay = switch (entries.get(caller)) {
          case (?m) m;
          case null Map.empty<Nat, Types.SalesEntry>();
        };
        let all = byDay.values().toArray();
        let totalSold = all.foldLeft(0, func (acc, e) = acc + e.quantity);
        let percent = if (challenge.target == 0) 0 else totalSold * 100 / challenge.target;
        let dayNumber = dayDiff(challenge.startDay, today) + 1;
        let daysRemaining = if (dayNumber >= 100) 0 else 100 - dayNumber;
        let currentStreak = streak(byDay, today);
        let perPlatform : [(Common.Platform, Nat)] = [
          (#shopee, platformTotal(all, #shopee)),
          (#tiktokShop, platformTotal(all, #tiktokShop)),
          (#lazada, platformTotal(all, #lazada)),
        ];
        let milestones : [Types.Milestone] = [
          milestone(10, "Langkah Pertama", percent),
          milestone(25, "Seperempat Jalan", percent),
          milestone(50, "Setengah Jalan", percent),
          milestone(75, "Tiga Perempat Jalan", percent),
          milestone(100, "Target Tercapai", percent),
        ];
        ?{
          target = challenge.target;
          totalSold = totalSold;
          percent = percent;
          dayNumber = dayNumber;
          daysRemaining = daysRemaining;
          currentStreak = currentStreak;
          perPlatform = perPlatform;
          milestones = milestones;
        };
      };
    };
  };

  func milestone(threshold : Nat, title : Text, percent : Nat) : Types.Milestone {
    { thresholdPercent = threshold; title = title; unlocked = percent >= threshold };
  };

  func platformTotal(entries : [Types.SalesEntry], platform : Common.Platform) : Nat {
    entries.foldLeft(0, func (acc, e) = if (e.platform == platform) acc + e.quantity else acc);
  };

  /// Count consecutive days with recorded sales ending at `today` (or the day
  /// before, so a streak is not lost before today's entry is made).
  func streak(byDay : Map.Map<Nat, Types.SalesEntry>, today : Common.DayKey) : Nat {
    var count = 0;
    var cursor = today;
    if (not byDay.containsKey(cursor)) {
      cursor := prevDay(cursor);
    };
    while (byDay.containsKey(cursor)) {
      count += 1;
      cursor := prevDay(cursor);
    };
    count;
  };

  /// Number of whole days from `from` to `to` (both YYYYMMDD keys).
  func dayDiff(from : Common.DayKey, to : Common.DayKey) : Nat {
    let a = daysFromCivil(from);
    let b = daysFromCivil(to);
    if (b >= a) (b - a).toNat() else 0;
  };

  /// The day before a YYYYMMDD key.
  func prevDay(day : Common.DayKey) : Common.DayKey {
    civilFromDays(daysFromCivil(day) - 1);
  };

  /// Days since the Unix epoch for a YYYYMMDD key.
  func daysFromCivil(day : Common.DayKey) : Int {
    let y = (day / 10_000).toInt();
    let m = ((day / 100) % 100).toInt();
    let d = (day % 100).toInt();
    let yy = if (m <= 2) y - 1 else y;
    let era = (if (yy >= 0) yy else yy - 399) / 400;
    let yoe = yy - era * 400;
    let mp = if (m > 2) m - 3 else m + 9;
    let doy = (153 * mp + 2) / 5 + d - 1;
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    era * 146_097 + doe - 719_468;
  };

  /// Convert a day count since the Unix epoch into a YYYYMMDD key.
  func civilFromDays(z0 : Int) : Common.DayKey {
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
