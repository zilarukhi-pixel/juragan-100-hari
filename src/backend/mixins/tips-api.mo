import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Common "../types/common";
import Types "../types/tips";
import TipsLib "../lib/tips";
import Day "../lib/day";

mixin (
  tips : Map.Map<Nat, Types.Tip>,
  done : Map.Map<Principal, Set.Set<Nat>>,
  favorites : Map.Map<Principal, Set.Set<Nat>>,
) {
  /// Return the tip scheduled for today.
  public query ({ caller }) func getTodayTip() : async ?Types.TipView {
    let today = Day.today();
    switch (TipsLib.getTipForDay(tips, today)) {
      case (?tip) {
        let doneSet = switch (done.get(caller)) { case (?s) s; case null Set.empty<Nat>() };
        let favSet = switch (favorites.get(caller)) { case (?s) s; case null Set.empty<Nat>() };
        ?TipsLib.toView(tip, doneSet, favSet);
      };
      case null null;
    };
  };

  /// Browse the tip archive, optionally filtered by day, platform, and theme.
  public query ({ caller }) func listTips(
    day : ?Common.DayKey,
    platform : ?Common.Platform,
    theme : ?Common.TipTheme,
  ) : async [Types.TipView] {
    let doneSet = switch (done.get(caller)) { case (?s) s; case null Set.empty<Nat>() };
    let favSet = switch (favorites.get(caller)) { case (?s) s; case null Set.empty<Nat>() };
    TipsLib.listTips(tips, day, platform, theme).map(
      func t = TipsLib.toView(t, doneSet, favSet)
    );
  };

  /// Mark a tip as done for the caller.
  public shared ({ caller }) func markTipDone(tipId : Nat) : async () {
    TipsLib.markDone(done, caller, tipId);
  };

  /// Remove the caller's done mark from a tip.
  public shared ({ caller }) func unmarkTipDone(tipId : Nat) : async () {
    TipsLib.unmarkDone(done, caller, tipId);
  };

  /// Add a tip to the caller's favorites.
  public shared ({ caller }) func addFavorite(tipId : Nat) : async () {
    TipsLib.addFavorite(favorites, caller, tipId);
  };

  /// Remove a tip from the caller's favorites.
  public shared ({ caller }) func removeFavorite(tipId : Nat) : async () {
    TipsLib.removeFavorite(favorites, caller, tipId);
  };

  /// Return the caller's favorite tips.
  public query ({ caller }) func listFavorites() : async [Types.TipView] {
    let doneSet = switch (done.get(caller)) { case (?s) s; case null Set.empty<Nat>() };
    let favSet = switch (favorites.get(caller)) { case (?s) s; case null Set.empty<Nat>() };
    TipsLib.listFavorites(tips, favorites, caller).map(
      func t = TipsLib.toView(t, doneSet, favSet)
    );
  };
};
