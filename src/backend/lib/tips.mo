import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Common "../types/common";
import Types "../types/tips";

module {
  /// Return the tip scheduled for the given day, if any.
  public func getTipForDay(tips : Map.Map<Nat, Types.Tip>, day : Common.DayKey) : ?Types.Tip {
    tips.values().find(func t = t.day == day);
  };

  /// Return every tip for a day, optionally filtered by platform and theme.
  public func listTips(
    tips : Map.Map<Nat, Types.Tip>,
    day : ?Common.DayKey,
    platform : ?Common.Platform,
    theme : ?Common.TipTheme,
  ) : [Types.Tip] {
    tips.values()
      .filter(func t {
        let dayOk = switch (day) { case (?d) t.day == d; case null true };
        let platformOk = switch (platform) { case (?p) t.platform == p; case null true };
        let themeOk = switch (theme) { case (?th) t.theme == th; case null true };
        dayOk and platformOk and themeOk;
      })
      .toArray();
  };

  /// Mark a tip as done for the caller.
  public func markDone(
    done : Map.Map<Principal, Set.Set<Nat>>,
    caller : Principal,
    tipId : Nat,
  ) : () {
    let set = switch (done.get(caller)) {
      case (?s) s;
      case null {
        let s = Set.empty<Nat>();
        done.add(caller, s);
        s;
      };
    };
    set.add(tipId);
  };

  /// Remove the caller's done mark from a tip.
  public func unmarkDone(
    done : Map.Map<Principal, Set.Set<Nat>>,
    caller : Principal,
    tipId : Nat,
  ) : () {
    switch (done.get(caller)) {
      case (?s) s.remove(tipId);
      case null {};
    };
  };

  /// Add a tip to the caller's favorites.
  public func addFavorite(
    favorites : Map.Map<Principal, Set.Set<Nat>>,
    caller : Principal,
    tipId : Nat,
  ) : () {
    let set = switch (favorites.get(caller)) {
      case (?s) s;
      case null {
        let s = Set.empty<Nat>();
        favorites.add(caller, s);
        s;
      };
    };
    set.add(tipId);
  };

  /// Remove a tip from the caller's favorites.
  public func removeFavorite(
    favorites : Map.Map<Principal, Set.Set<Nat>>,
    caller : Principal,
    tipId : Nat,
  ) : () {
    switch (favorites.get(caller)) {
      case (?s) s.remove(tipId);
      case null {};
    };
  };

  /// Return the caller's favorite tips.
  public func listFavorites(
    tips : Map.Map<Nat, Types.Tip>,
    favorites : Map.Map<Principal, Set.Set<Nat>>,
    caller : Principal,
  ) : [Types.Tip] {
    let favs = switch (favorites.get(caller)) {
      case (?s) s;
      case null Set.empty<Nat>();
    };
    tips.values().filter(func t = favs.contains(t.id)).toArray();
  };

  /// Project a tip into its caller-specific view.
  public func toView(
    tip : Types.Tip,
    done : Set.Set<Nat>,
    favorites : Set.Set<Nat>,
  ) : Types.TipView {
    {
      id = tip.id;
      day = tip.day;
      title = tip.title;
      summary = tip.summary;
      actionStep = tip.actionStep;
      platform = tip.platform;
      theme = tip.theme;
      done = done.contains(tip.id);
      favorite = favorites.contains(tip.id);
    };
  };
};
