import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Common "../types/common";
import Types "../types/game";

module {
  /// Return today's quiz questions with the correct answers withheld.
  public func getTodayQuiz(
    questions : Map.Map<Nat, Types.QuizQuestion>,
    day : Common.DayKey,
  ) : [Types.QuizQuestionView] {
    questions.values()
      .filter(func q = q.day == day)
      .map(func q = { id = q.id; prompt = q.prompt; options = q.options })
      .toArray();
  };

  /// Return the caller's stored result for a day, if they already played.
  public func getResult(
    results : Map.Map<Principal, Map.Map<Nat, Types.QuizResult>>,
    caller : Principal,
    day : Common.DayKey,
  ) : ?Types.QuizResult {
    switch (results.get(caller)) {
      case (?byDay) byDay.get(day);
      case null null;
    };
  };

  /// Grade the caller's answers, persist the result, and return feedback.
  public func submitQuiz(
    questions : Map.Map<Nat, Types.QuizQuestion>,
    results : Map.Map<Principal, Map.Map<Nat, Types.QuizResult>>,
    caller : Principal,
    day : Common.DayKey,
    answers : [(Nat, Nat)],
    now : Common.Timestamp,
  ) : Types.QuizSubmission {
    let dayQuestions = questions.values().filter(func q = q.day == day).toArray();
    var score = 0;
    let feedback = dayQuestions.map(
      func q {
        let chosen = switch (answers.find(func a = a.0 == q.id)) {
          case (?(_, idx)) idx;
          case null 0;
        };
        let correct = chosen == q.correctIndex;
        if (correct) { score += 1 };
        {
          questionId = q.id;
          chosenIndex = chosen;
          correctIndex = q.correctIndex;
          correct = correct;
          explanation = q.explanation;
        };
      }
    );
    let total = dayQuestions.size();
    let points = score * 10;
    let result : Types.QuizResult = {
      day = day;
      score = score;
      total = total;
      points = points;
      completedAt = now;
    };
    let byDay = switch (results.get(caller)) {
      case (?m) m;
      case null {
        let m = Map.empty<Nat, Types.QuizResult>();
        results.add(caller, m);
        m;
      };
    };
    byDay.add(day, result);
    {
      day = day;
      score = score;
      total = total;
      points = points;
      feedback = feedback;
    };
  };

  /// Return the caller's quiz history, newest first.
  public func listHistory(
    results : Map.Map<Principal, Map.Map<Nat, Types.QuizResult>>,
    caller : Principal,
  ) : [Types.QuizResult] {
    switch (results.get(caller)) {
      case (?byDay) {
        byDay.values().toArray().sort(func (a, b) = if (a.day > b.day) #less else if (a.day < b.day) #greater else #equal);
      };
      case null [];
    };
  };
};
