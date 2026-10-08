import Common "common";

module {
  /// A user's 100-day challenge configuration.
  public type Challenge = {
    target : Nat;
    startDay : Common.DayKey;
    createdAt : Common.Timestamp;
  };

  /// One day's recorded sales.
  public type SalesEntry = {
    day : Common.DayKey;
    quantity : Nat;
    platform : Common.Platform;
    updatedAt : Common.Timestamp;
  };

  /// A milestone unlocked at a progress threshold.
  public type Milestone = {
    thresholdPercent : Nat;
    title : Text;
    unlocked : Bool;
  };

  /// Aggregate progress for the caller's challenge.
  public type ChallengeProgress = {
    target : Nat;
    totalSold : Nat;
    percent : Nat;
    dayNumber : Nat;
    daysRemaining : Nat;
    currentStreak : Nat;
    perPlatform : [(Common.Platform, Nat)];
    milestones : [Milestone];
  };
};
