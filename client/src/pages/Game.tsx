import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Logo } from "@/components/Logo";
import { GameCard } from "@/components/GameCard";
import { GameStatus } from "@/components/GameStatus";
import { ClueDisplay } from "@/components/ClueDisplay";
import { PlayerList } from "@/components/PlayerList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useWebSocketContext } from "@/contexts/WebSocketContext";
import { Send, Copy, Check, Loader2, Users, Clock, Target, ArrowLeft, Lightbulb, Eye, EyeOff, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Lobby from "./Lobby";

export default function Game() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isConnected, gameState, playerId, roomCode, error, send } = useWebSocketContext();
  const [clueWord, setClueWord] = useState("");
  const [clueCount, setClueCount] = useState("1");
  const [copied, setCopied] = useState(false);
  const [showRoomCode, setShowRoomCode] = useState(false);

  useEffect(() => {
    if (error) {
      toast({
        title: "Hata",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (gameState?.phase === "ended") {
      setLocation("/end");
    }
  }, [gameState, setLocation]);

  const handleCopyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      toast({
        title: "Kopyalandı!",
        description: "Oda kodu panoya kopyalandı",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGiveClue = () => {
    const count = parseInt(clueCount);
    if (clueWord.trim() && count >= 0 && count <= 9) {
      send("give_clue", { word: clueWord.trim(), count });
      setClueWord("");
      setClueCount("1");
    }
  };

  const handleRevealCard = (cardId: number) => {
    send("reveal_card", { cardId });
  };

  const handleRestart = () => {
    send("restart_game", {});
  };

  useEffect(() => {
    if (!gameState && isConnected) {
      setLocation("/rooms");
    }
  }, [gameState, isConnected, setLocation]);

  if (!isConnected || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900" style={{ backgroundImage: 'url(/arkaplan.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <Card className="p-12 space-y-6 text-center border-2 shadow-2xl bg-slate-900/90 backdrop-blur-md border-orange-900/30 animate-pulse-slow">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold">
              {!isConnected ? "Bağlanıyor" : "Yükleniyor"}
            </p>
            <p className="text-sm text-muted-foreground">
              {!isConnected ? "Sunucuya bağlanılıyor..." : "Oyun hazırlanıyor..."}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (gameState.phase === "lobby") {
    return <Lobby />;
  }

  const currentPlayer = gameState.players.find(p => p.id === playerId);
  if (!currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background bg-grid-pattern">
        <Card className="p-12 space-y-6 text-center border-2 shadow-2xl">
          <p className="text-lg font-semibold text-muted-foreground">Oyuncu bulunamadı</p>
          <Button onClick={() => setLocation("/")} variant="outline">
            Ana Sayfaya Dön
          </Button>
        </Card>
      </div>
    );
  }

  const isSpymaster = currentPlayer.role === "spymaster";
  const isCurrentTurn = currentPlayer.team === gameState.currentTeam;
  const canGiveClue = isSpymaster && isCurrentTurn && !gameState.currentClue;
  const canRevealCard = !isSpymaster && isCurrentTurn;

  const darkPlayers = gameState.players.filter(p => p.team === "dark");
  const lightPlayers = gameState.players.filter(p => p.team === "light");

  return (
    <div className="h-screen overflow-hidden bg-slate-900 relative" style={{ backgroundImage: 'url(/arkaplan.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      {/* Light Effects */}
      <div className="light-effect light-1" />
      <div className="light-effect light-2" />
      <div className="light-effect light-3" />
      <div className="light-effect light-4" />
      <div className="light-effect light-5" />
      
      {[...Array(70)].map((_, i) => (
        <div key={i} className={`particle particle-${i + 1}`} />
      ))}
      <div className="relative z-10 h-full flex flex-col p-2 animate-in fade-in duration-500">
        <div className="w-full flex-1 flex flex-col gap-2 min-h-0">
        {/* Modern Header */}
        <Card className="p-1.5 md:p-2 border-2 shadow-2xl bg-slate-900/85 backdrop-blur-md border-orange-900/30 hover:shadow-primary/20 transition-all flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            {/* Left Side - Room Code & Players */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">Oda Kodu:</div>
                <div className="text-sm font-mono font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
                  {showRoomCode ? roomCode : "••••••"}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowRoomCode(!showRoomCode)}
                  className="h-6 w-6 p-0 hover:bg-primary/10"
                >
                  {showRoomCode ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyRoomCode}
                  data-testid="button-copy-code"
                  className="h-7 border-2 hover:border-primary hover:bg-primary/10"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
              
              {/* Players Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 border-2 hover:border-blue-500 hover:bg-blue-500/10"
                  >
                    <Users className="w-3 h-3 mr-1" />
                    Oyuncular ({gameState.players.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900/95 border-2 border-orange-900/30 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
                      Oyuncular & İzleyiciler
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {/* Dark Team */}
                    <div>
                      <h3 className="text-sm font-bold text-blue-400 mb-2">{gameState.darkTeamName}</h3>
                      <div className="space-y-1">
                        {darkPlayers.map(player => (
                          <div key={player.id} className="flex items-center justify-between p-2 rounded bg-blue-950/50 border border-blue-800/30">
                            <span className="text-sm text-blue-100">{player.username}</span>
                            <span className="text-xs text-blue-300">{player.role === "spymaster" ? "İpucu Veren" : "Tahminci"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Light Team */}
                    <div>
                      <h3 className="text-sm font-bold text-red-400 mb-2">{gameState.lightTeamName}</h3>
                      <div className="space-y-1">
                        {lightPlayers.map(player => (
                          <div key={player.id} className="flex items-center justify-between p-2 rounded bg-red-950/50 border border-red-800/30">
                            <span className="text-sm text-red-100">{player.username}</span>
                            <span className="text-xs text-red-300">{player.role === "spymaster" ? "İpucu Veren" : "Tahminci"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Spectators */}
                    {gameState.players.filter(p => !p.team).length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-400 mb-2">İzleyiciler</h3>
                        <div className="space-y-1">
                          {gameState.players.filter(p => !p.team).map(player => (
                            <div key={player.id} className="flex items-center p-2 rounded bg-slate-800/50 border border-slate-700/30">
                              <span className="text-sm text-gray-300">{player.username}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Right Side - Actions */}
            <div className="flex items-center gap-2">
              {currentPlayer?.isRoomOwner && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRestart}
                  data-testid="button-restart"
                  className="h-7 border-2 hover:border-amber-500 hover:bg-amber-500/10"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Yenile
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  send("leave_room", {});
                  localStorage.removeItem("katmannames_room_code");
                  localStorage.removeItem("katmannames_player_id");
                  setLocation("/rooms");
                }}
                className="h-7 border-2 hover:border-red-600 hover:bg-red-600/10"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Oyundan Çık
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr_180px] xl:grid-cols-[200px_1fr_200px] gap-2 flex-1 min-h-0">
          {/* Left Side - Dark Team */}
          <div className="hidden lg:flex lg:flex-col lg:gap-2">
            {/* Score Card */}
            <Card className="p-2 border-2 shadow-2xl bg-gradient-to-br from-blue-950/95 to-blue-900/95 border-blue-700/50 hover:shadow-blue-500/30 transition-all group">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  <h3 className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">{gameState.darkTeamName}</h3>
                </div>
                <div className="relative">
                  <div className="text-4xl lg:text-5xl font-black text-blue-100 group-hover:scale-110 transition-transform">
                    {gameState.darkCardsRemaining}
                  </div>
                  <div className="absolute inset-0 blur-2xl bg-blue-500/20 group-hover:bg-blue-500/40 transition-all" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-blue-200/80 font-semibold uppercase">Kalan Kart</p>
                  {gameState.currentTeam === "dark" && (
                    <div className="inline-block px-2 py-0.5 bg-blue-600/30 rounded-full">
                      <p className="text-[9px] text-blue-100 font-bold">● SIRA SIZDE</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
            
            {/* Players Card */}
            <Card className="p-3 md:p-4 border-2 bg-blue-950/80 border-blue-800/30 backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-bold text-blue-100 uppercase tracking-wide">Oyuncular</h4>
              </div>
              <div className="space-y-2">
                {darkPlayers.map(player => (
                  <div 
                    key={player.id} 
                    className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                      player.id === playerId 
                        ? "bg-blue-600/30 border border-blue-500/50" 
                        : "bg-blue-900/20 hover:bg-blue-900/40"
                    }`}
                  >
                    <span className={`text-sm ${player.id === playerId ? "font-bold text-blue-100" : "text-blue-200/90"}`}>
                      {player.username}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      player.role === "spymaster" 
                        ? "bg-amber-500/20 text-amber-300 font-semibold" 
                        : "bg-blue-500/20 text-blue-300"
                    }`}>
                      {player.role === "spymaster" ? (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          İpucu
                        </span>
                      ) : (
                        "Tahminci"
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Center - Grid */}
          <div className="flex flex-col min-h-0 flex-1 gap-2 items-center justify-between p-2">
            {/* Mobile Score Display */}
            <div className="lg:hidden w-full flex-shrink-0">
              <div className="grid grid-cols-2 gap-2">
                <Card className="p-1.5 border-2 bg-gradient-to-br from-blue-950/90 to-blue-900/90 border-blue-700/50">
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-blue-100">{gameState.darkTeamName}</div>
                    <div className="text-xl font-black text-blue-100">{gameState.darkCardsRemaining}</div>
                    {gameState.currentTeam === "dark" && (
                      <div className="text-[9px] text-blue-100 font-bold">● SIRA</div>
                    )}
                  </div>
                </Card>
                <Card className="p-1.5 border-2 bg-gradient-to-br from-red-950/90 to-red-900/90 border-red-800/50">
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-red-100">{gameState.lightTeamName}</div>
                    <div className="text-xl font-black text-red-100">{gameState.lightCardsRemaining}</div>
                    {gameState.currentTeam === "light" && (
                      <div className="text-[9px] text-red-100 font-bold">● SIRA</div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
            
            <div className="grid grid-cols-5 grid-rows-5 gap-[2px] sm:gap-1 md:gap-1.5 w-full max-w-[900px] flex-1 auto-rows-fr" data-testid="game-grid">
              {gameState.cards.map((card, index) => (
                <GameCard
                  key={`pos-${index}`}
                  card={card}
                  onReveal={() => handleRevealCard(card.id)}
                  isSpymaster={isSpymaster}
                  disabled={!canRevealCard}
                />
              ))}
            </div>

            {/* Clue Input/Display at Bottom */}
            <div className="flex justify-center flex-shrink-0">
              {canGiveClue ? (
                <Card className="p-2 border-2 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-500/50 transition-all">
                  <div className="space-y-1">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-amber-900">
                        <Lightbulb className="w-3 h-3" />
                        <Label className="text-[10px] font-bold uppercase">İpucu Ver</Label>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Input
                        data-testid="input-clue-word"
                        placeholder="KELİME"
                        value={clueWord}
                        onChange={(e) => setClueWord(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && handleGiveClue()}
                        maxLength={20}
                        className="w-32 text-center font-bold text-sm uppercase bg-white border-2 border-amber-500/30 focus:border-amber-500 h-8"
                      />
                      <Input
                        data-testid="input-clue-count"
                        type="number"
                        min="0"
                        max="9"
                        value={clueCount}
                        onChange={(e) => setClueCount(e.target.value)}
                        className="w-12 text-center font-bold text-lg text-black bg-white border-2 border-amber-500/30 focus:border-amber-500 h-8"
                      />
                      <Button
                        onClick={handleGiveClue}
                        disabled={!clueWord.trim() || parseInt(clueCount) < 0}
                        data-testid="button-give-clue"
                        size="sm"
                        className="h-8 px-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl hover:shadow-amber-500/50 group"
                      >
                        <Send className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : gameState.currentClue ? (
                <Card className="px-3 py-1.5 border-2 shadow-2xl bg-gradient-to-br from-amber-100 to-orange-100 border-amber-600/50 hover:shadow-amber-500/50 transition-all relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shimmer" />
                  <div className="relative text-center">
                    <div className="flex items-center justify-center gap-1.5 text-amber-900/60">
                      <Lightbulb className="w-3 h-3" />
                      <span className="text-[10px] font-semibold uppercase">İpucu</span>
                    </div>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-lg font-black text-amber-900 uppercase tracking-wider">
                        {gameState.currentClue.word}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-lg">
                        <span className="text-base font-black text-white">
                          {gameState.currentClue.count}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : null}
            </div>
          </div>

          {/* Right Side - Light Team */}
          <div className="hidden lg:flex lg:flex-col lg:gap-2">
            {/* Score Card */}
            <Card className="p-2 border-2 shadow-2xl bg-gradient-to-br from-red-950/95 to-red-950/95 border-red-800/50 hover:shadow-red-600/30 transition-all group">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  <h3 className="text-[10px] font-bold text-red-100 uppercase tracking-wider">{gameState.lightTeamName}</h3>
                </div>
                <div className="relative">
                  <div className="text-4xl lg:text-5xl font-black text-red-100 group-hover:scale-110 transition-transform">
                    {gameState.lightCardsRemaining}
                  </div>
                  <div className="absolute inset-0 blur-2xl bg-red-600/20 group-hover:bg-red-600/40 transition-all" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-red-200/80 font-semibold uppercase">Kalan Kart</p>
                  {gameState.currentTeam === "light" && (
                    <div className="inline-block px-2 py-0.5 bg-red-700/30 rounded-full">
                      <p className="text-[9px] text-red-100 font-bold">● SIRA SIZDE</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
            
            {/* Players Card */}
            <Card className="p-3 md:p-4 border-2 bg-red-950/80 border-red-900/30 backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-red-500" />
                <h4 className="text-sm font-bold text-red-100 uppercase tracking-wide">Oyuncular</h4>
              </div>
              <div className="space-y-2">
                {lightPlayers.map(player => (
                  <div 
                    key={player.id} 
                    className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                      player.id === playerId 
                        ? "bg-red-700/30 border border-red-600/50" 
                        : "bg-red-950/20 hover:bg-red-950/40"
                    }`}
                  >
                    <span className={`text-sm ${player.id === playerId ? "font-bold text-red-100" : "text-red-200/90"}`}>
                      {player.username}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      player.role === "spymaster" 
                        ? "bg-amber-500/20 text-amber-300 font-semibold" 
                        : "bg-red-600/20 text-red-400"
                    }`}>
                      {player.role === "spymaster" ? (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          İpucu
                        </span>
                      ) : (
                        "Tahminci"
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Game Status Card */}
            <Card className="p-5 border-2 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm shadow-xl max-h-80 overflow-y-auto">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wide">Oyun Durumu</h4>
              </div>
              <div className="space-y-3">
                {gameState.currentClue && (
                  <div className="p-3 bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-lg border border-amber-500/30">
                    <div className="text-xs text-amber-300 font-semibold mb-1">Aktif İpucu</div>
                    <div className="text-lg font-black text-amber-100">
                      {gameState.currentClue.word} <span className="text-2xl">{gameState.currentClue.count}</span>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-xs text-muted-foreground mb-1">Sıra</div>
                    <div className={`text-sm font-bold ${
                      gameState.currentTeam === "dark" ? "text-blue-400" : "text-red-500"
                    }`}>
                      {gameState.currentTeam === "dark" ? "Koyu" : "Açık"}
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-xs text-muted-foreground mb-1">Açılan</div>
                    <div className="text-sm font-bold text-white">
                      {gameState.revealHistory.length}/25
                    </div>
                  </div>
                </div>
                {gameState.revealHistory.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      Son Açılan Kartlar
                    </div>
                    <div className="space-y-2">
                      {gameState.revealHistory.slice(-5).reverse().map((entry, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                        >
                          <div className={`w-3 h-3 rounded-full shadow-lg ${
                            entry.type === "dark" ? "bg-blue-600 shadow-blue-500/50" :
                            entry.type === "light" ? "bg-red-700 shadow-red-600/50" :
                            entry.type === "neutral" ? "bg-gray-400" :
                            "bg-red-600 shadow-red-500/50"
                          }`} />
                          <span className="text-sm font-semibold text-white flex-1">{entry.word}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            entry.team === "dark" ? "bg-blue-600/20 text-blue-300" : "bg-red-700/20 text-red-400"
                          }`}>
                            {entry.team === "dark" ? "Koyu" : "Açık"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
