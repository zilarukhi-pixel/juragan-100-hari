import Map "mo:core/Map";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import Common "types/common";
import TipTypes "types/tips";
import GameTypes "types/game";
import ChallengeTypes "types/challenge";
import TipsApi "mixins/tips-api";
import GameApi "mixins/game-api";
import ChallengeApi "mixins/challenge-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);

  let tips : Map.Map<Nat, TipTypes.Tip>;
  let done : Map.Map<Principal, Set.Set<Nat>>;
  let favorites : Map.Map<Principal, Set.Set<Nat>>;
  let questions : Map.Map<Nat, GameTypes.QuizQuestion>;
  let quizResults : Map.Map<Principal, Map.Map<Nat, GameTypes.QuizResult>>;
  let challengeStore : Map.Map<Principal, ChallengeTypes.Challenge>;
  let salesEntries : Map.Map<Principal, Map.Map<Nat, ChallengeTypes.SalesEntry>>;

  include TipsApi(tips, done, favorites);
  include GameApi(questions, quizResults);
  include ChallengeApi(challengeStore, salesEntries, quizResults);
  include ApiDocMixin();

  // Flatten the per-user nested maps into a single row stream for OQL.
  func allSales() : Iter.Iter<ChallengeTypes.SalesEntry> {
    salesEntries.values().flatMap(func (byDay) = byDay.values());
  };

  func allQuizResults() : Iter.Iter<GameTypes.QuizResult> {
    quizResults.values().flatMap(func (byDay) = byDay.values());
  };

  // Flatten the per-user tip-id sets into (owner, tipId) rows for OQL.
  func allDone() : Iter.Iter<(Principal, Nat)> {
    done.entries().flatMap(func ((owner, ids)) = ids.values().map(func id = (owner, id)));
  };

  func allFavorites() : Iter.Iter<(Principal, Nat)> {
    favorites.entries().flatMap(func ((owner, ids)) = ids.values().map(func id = (owner, id)));
  };

  func platformText(p : Common.Platform) : Text {
    switch p {
      case (#shopee) "shopee";
      case (#tiktokShop) "tiktokShop";
      case (#lazada) "lazada";
    };
  };

  func themeText(t : Common.TipTheme) : Text {
    switch t {
      case (#listing) "listing";
      case (#konten) "konten";
      case (#promosi) "promosi";
      case (#layananPelanggan) "layananPelanggan";
      case (#analisisData) "analisisData";
    };
  };

  include Expose({
    entities = [
      Entity.manual<TipTypes.Tip>("tip", func () = tips.values(), "Tip", "id")
        .sample({
          id = 0;
          day = 0;
          title = "";
          summary = "";
          actionStep = "";
          platform = #shopee;
          theme = #listing;
        })
        .payload("id", func t = t.id)
        .payload("day", func t = t.day)
        .payload("title", func t = t.title)
        .payload("summary", func t = t.summary)
        .payload("actionStep", func t = t.actionStep)
        .payload("platform", func t = platformText(t.platform))
        .payload("theme", func t = themeText(t.theme))
        .public_()
        .build(),
      Entity.manual<GameTypes.QuizQuestion>("quizQuestion", func () = questions.values(), "QuizQuestion", "id")
        .sample({
          id = 0;
          day = 0;
          prompt = "";
          options = [];
          correctIndex = 0;
          explanation = "";
        })
        .payload("id", func q = q.id)
        .payload("day", func q = q.day)
        .payload("prompt", func q = q.prompt)
        .payload("options", func q = q.options.values().join(" | "))
        .payload("correctIndex", func q = q.correctIndex)
        .payload("explanation", func q = q.explanation)
        .public_()
        .build(),
      Entity.manual<ChallengeTypes.Challenge>("challenge", func () = challengeStore.values(), "Challenge", "id")
        .sample({ target = 0; startDay = 0; createdAt = 0 })
        .payload("target", func c = c.target)
        .payload("startDay", func c = c.startDay)
        .payload("createdAt", func c = c.createdAt)
        .controllerOnly()
        .build(),
      Entity.manual<ChallengeTypes.SalesEntry>("salesEntry", allSales, "SalesEntry", "id")
        .sample({ day = 0; quantity = 0; platform = #shopee; updatedAt = 0 })
        .payload("day", func e = e.day)
        .payload("quantity", func e = e.quantity)
        .payload("platform", func e = platformText(e.platform))
        .payload("updatedAt", func e = e.updatedAt)
        .controllerOnly()
        .build(),
      Entity.manual<GameTypes.QuizResult>("quizResult", allQuizResults, "QuizResult", "id")
        .sample({ day = 0; score = 0; total = 0; points = 0; completedAt = 0 })
        .payload("day", func r = r.day)
        .payload("score", func r = r.score)
        .payload("total", func r = r.total)
        .payload("points", func r = r.points)
        .payload("completedAt", func r = r.completedAt)
        .controllerOnly()
        .build(),
      Entity.manual<(Principal, Nat)>("tipDone", allDone, "TipDone", "owner")
        .sample((Principal.fromText("aaaaa-aa"), 0))
        .payload("owner", func ((owner, _)) = owner)
        .payload("tipId", func ((_, id)) = id)
        .ownedBy("owner")
        .scopedPerUser()
        .build(),
      Entity.manual<(Principal, Nat)>("tipFavorite", allFavorites, "TipFavorite", "owner")
        .sample((Principal.fromText("aaaaa-aa"), 0))
        .payload("owner", func ((owner, _)) = owner)
        .payload("tipId", func ((_, id)) = id)
        .ownedBy("owner")
        .scopedPerUser()
        .build(),
    ];
  });
};
