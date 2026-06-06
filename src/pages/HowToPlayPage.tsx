import { Card, Layout, SecondaryButton } from "../components/Layout";
import { START_GAME_PATH } from "../config/features";

export function HowToPlayPage() {
  return (
    <Layout showBack backTo="/">
      <div className="space-y-5 md:space-y-6">
        <div>
          <h1 className="text-3xl font-black uppercase md:text-5xl">How to play</h1>
          <p className="mt-2 text-white/60 md:text-lg">
            A local party game for football nerds.
          </p>
        </div>

        <Card>
          <h2 className="mb-2 font-bold md:text-xl">Top Order</h2>
          <p className="text-sm leading-6 text-white/70 md:text-base md:leading-7">
            Name entries from a ranked list — for example Premier League top
            scorers or all-time UCL goal scorers. Correct answers fill in their
            rank on the board.
          </p>
        </Card>

        <Card>
          <h2 className="mb-2 font-bold md:text-xl">Turns</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-white/70 md:text-base md:leading-7">
            <li>Type a name you think is on the list.</li>
            <li>Correct answer = +100 points and the rank is revealed.</li>
            <li>Wrong guess = 0 points, next player&apos;s turn.</li>
            <li>Spend points to reveal nation hints for a rank.</li>
          </ol>
        </Card>

        <Card>
          <h2 className="mb-2 font-bold md:text-xl">When it ends</h2>
          <p className="text-sm leading-6 text-white/70 md:text-base md:leading-7">
            The game ends when all 10 entries are found, or after 3 full rounds
            with no new correct guesses. Highest score wins.
          </p>
        </Card>

        <Card>
          <h2 className="mb-2 font-bold md:text-xl">Tips</h2>
          <p className="text-sm leading-6 text-white/70 md:text-base md:leading-7">
            Last names usually work when they&apos;re unique on the list. Use
            full names if two players share a surname.
          </p>
        </Card>

        <SecondaryButton to={START_GAME_PATH}>Start game</SecondaryButton>
      </div>
    </Layout>
  );
}
