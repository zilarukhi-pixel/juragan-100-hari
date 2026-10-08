import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Common "../types/common";
import Types "../types/challenge";
import GameTypes "../types/game";
import ChallengeLib "../lib/challenge";
import Day "../lib/day";

mixin (
  challengesStore : Map.Map<Principal, Types.Challenge>,
  entries : Map.Map<Principal, Map.Map<Nat, Types.SalesEntry>>,
  quizResults : Map.Map<Principal, Map.Map<Nat, GameTypes.QuizResult>>,
) {
  /// Start the caller's 100-day challenge.
  public shared ({ caller }) func startChallenge(target : Nat, startDay : Common.DayKey) : async Types.Challenge {
    ChallengeLib.startChallenge(challengesStore, caller, target, startDay, Time.now());
  };

  /// Return the caller's challenge configuration.
  public query ({ caller }) func getChallenge() : async ?Types.Challenge {
    ChallengeLib.getChallenge(challengesStore, caller);
  };

  /// Record or update the caller's sales for a day.
  public shared ({ caller }) func recordSales(
    day : Common.DayKey,
    quantity : Nat,
    platform : Common.Platform,
  ) : async Types.SalesEntry {
    ChallengeLib.recordSales(entries, caller, day, quantity, platform, Time.now());
  };

  /// Return the caller's sales history, newest first, optionally filtered by
  /// platform and an inclusive day range.
  public query ({ caller }) func listSales(
    platform : ?Common.Platform,
    fromDay : ?Common.DayKey,
    toDay : ?Common.DayKey,
  ) : async [Types.SalesEntry] {
    ChallengeLib.listSales(entries, caller, platform, fromDay, toDay);
  };

  /// Return the caller's aggregate challenge progress.
  public query ({ caller }) func getProgress() : async ?Types.ChallengeProgress {
    ChallengeLib.getProgress(challengesStore, entries, quizResults, caller, Day.today());
  };
};
