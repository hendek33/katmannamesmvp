import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Logo } from "@/components/Logo";
import { PlayerList } from "@/components/PlayerList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useWebSocketContext } from "@/contexts/WebSocketContext";
import { Copy, Check, Plus, LogIn, Loader2, Bot, Sparkles, Users, Play, ArrowLeft, Eye, EyeOff, Timer, Lock, AlertCircle, X, ChevronUp, ChevronDown } from "lucide-react";
import type { Team } from "@shared/schema";

export default function Lobby() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isConnected, gameState, playerId, roomCode, error, send } = useWebSocketContext();
  const [mode, setMode] = useState<"select" | "create" | "join">("select");
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [username, setUsername] = useState("");
  const [showRoomCode, setShowRoomCode] = useState(false);
  const [timedMode, setTimedMode] = useState(false);
  const [spymasterTime, setSpymasterTime] = useState(120); // 2 minutes default
  const [guesserTime, setGuesserTime] = useState(180); // 3 minutes default
  const [chaosMode, setChaosMode] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem("katmannames_username");
    if (!savedUsername) {
      setLocation("/");
    } else {
      setUsername(savedUsername);
    }
  }, [setLocation]);

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
    if (gameState?.phase === "playing") {
      setLocation("/game");
    }
  }, [gameState, setLocation]);

  useEffect(() => {
    // Sync timer and chaos mode settings from gameState
    if (gameState) {
      setTimedMode(gameState.timedMode);
      setSpymasterTime(gameState.spymasterTime);
      setGuesserTime(gameState.guesserTime);
      setChaosMode(gameState.chaosMode || false);
    }
  }, [gameState]);

  const handleCreateRoom = () => {
    if (username) {
      send("create_room", { username });
    }
  };

  const handleJoinRoom = () => {
    if (username && joinCode.trim().length >= 4) {
      send("join_room", { roomCode: joinCode.toUpperCase(), username });
    }
  };

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

  const handleTeamSelect = (team: Team) => {
    send("select_team", { team });
  };

  const handleRoleToggle = () => {
    const currentPlayer = gameState?.players.find(p => p.id === playerId);
    if (currentPlayer) {
      const newRole = currentPlayer.role === "spymaster" ? "guesser" : "spymaster";
      send("select_role", { role: newRole });
    }
  };

  const [showTeamNameWarning, setShowTeamNameWarning] = useState(false);

  const handleStartGame = () => {
    // Check if team names are still default
    if (gameState?.darkTeamName === "Katman Koyu" && gameState?.lightTeamName === "Katman Açık") {
      setShowTeamNameWarning(true);
    } else {
      send("start_game", {});
    }
  };
  
  const handleConfirmStartWithDefaultNames = () => {
    setShowTeamNameWarning(false);
    send("start_game", {});
  };

  const handleAddBot = (team: "dark" | "light", role: "spymaster" | "guesser") => {
    send("add_bot", { team, role });
  };

  const handleRemoveBot = (botId: string) => {
    send("remove_bot", { botId });
  };

  const handleTeamNameChange = (team: Team, name: string) => {
    if (team === "dark" || team === "light") {
      send("update_team_name", { team, name });
    }
  };

  const handleTimerSettingsUpdate = (mode: boolean, spyTime: number, guessTime: number) => {
    send("update_timer_settings", { 
      timedMode: mode,
      spymasterTime: spyTime,
      guesserTime: guessTime 
    });
  };

  const handleChaosModeUpdate = (enabled: boolean) => {
    send("update_chaos_mode", { chaosMode: enabled });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 relative overflow-hidden" style={{ backgroundImage: 'url(/arkaplan.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        {/* Light Effects */}
        <div className="light-effect light-1" />
        <div className="light-effect light-2" />
        <div className="light-effect light-3" />
        <div className="light-effect light-4" />
        <div className="light-effect light-5" />
        
        {[...Array(70)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`} />
        ))}
        <Card className="p-12 space-y-6 text-center border-2 shadow-2xl bg-slate-900/90 backdrop-blur-md border-orange-900/30 animate-pulse-slow">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold">Bağlanıyor</p>
            <p className="text-sm text-muted-foreground">Sunucuya bağlanılıyor...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!roomCode && mode === "select") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 relative overflow-hidden" style={{ backgroundImage: 'url(/arkaplan.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        {/* Light Effects */}
        <div className="light-effect light-1" />
        <div className="light-effect light-2" />
        <div className="light-effect light-3" />
        <div className="light-effect light-4" />
        <div className="light-effect light-5" />
        
        {[...Array(70)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`} />
        ))}
        <div className="w-full max-w-lg space-y-8 animate-in fade-in duration-500">
          <div className="space-y-4">
            <Card 
              className="group p-8 space-y-4 hover-elevate cursor-pointer transition-all border-2 bg-slate-900/85 backdrop-blur-md border-orange-900/30 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20 relative overflow-hidden" 
              onClick={handleCreateRoom}
              data-testid="button-create-room"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 shadow-lg group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-2xl">Oda Oluştur</h3>
                    <Sparkles className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-muted-foreground mt-1">Yeni bir oyun başlat ve arkadaşlarını bekle</p>
                </div>
              </div>
            </Card>

            <Card 
              className="group p-8 space-y-4 hover-elevate cursor-pointer transition-all border-2 bg-slate-900/85 backdrop-blur-md border-orange-900/30 hover:border-red-600/50 hover:shadow-2xl hover:shadow-red-600/20 relative overflow-hidden" 
              onClick={() => setMode("join")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-700 to-red-500 shadow-lg group-hover:scale-110 transition-transform">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-2xl">Odaya Katıl</h3>
                    <Users className="w-5 h-5 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-muted-foreground mt-1">Oda kodu ile arkadaşının oyununa gir</p>
                </div>
              </div>
            </Card>
          </div>

          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="w-full group"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  if (!roomCode && mode === "join") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 relative overflow-hidden" style={{ backgroundImage: 'url(/arkaplan.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        {/* Light Effects */}
        <div className="light-effect light-1" />
        <div className="light-effect light-2" />
        <div className="light-effect light-3" />
        <div className="light-effect light-4" />
        <div className="light-effect light-5" />
        
        {[...Array(70)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`} />
        ))}
        <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
          <Card className="p-8 space-y-6 shadow-2xl border-2 bg-slate-900/90 backdrop-blur-md border-orange-900/30 hover:shadow-red-600/20 transition-shadow">
            <div className="space-y-3 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-red-700 to-red-500 flex items-center justify-center shadow-lg">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Odaya Katıl</h2>
              <p className="text-sm text-muted-foreground">
                Arkadaşının sana verdiği oda kodunu gir
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomCode" className="text-sm font-semibold">Oda Kodu</Label>
                <Input
                  id="roomCode"
                  data-testid="input-room-code"
                  placeholder="ABCD12"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                  maxLength={6}
                  className="text-center text-2xl font-mono tracking-widest h-14 border-2 focus:border-red-600 transition-colors"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setMode("select")}
                className="flex-1"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri
              </Button>
              <Button
                onClick={handleJoinRoom}
                disabled={joinCode.length < 4}
                className="flex-1 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600"
                data-testid="button-join-room"
              >
                Katıl
                <LogIn className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 relative overflow-hidden" style={{ backgroundImage: 'url(/arkaplan.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        {/* Light Effects */}
        <div className="light-effect light-1" />
        <div className="light-effect light-2" />
        <div className="light-effect light-3" />
        <div className="light-effect light-4" />
        <div className="light-effect light-5" />
        
        {[...Array(70)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`} />
        ))}
        <Card className="p-12 space-y-6 text-center border-2 shadow-2xl bg-slate-900/90 backdrop-blur-md border-orange-900/30">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-lg font-semibold text-muted-foreground">Yükleniyor...</p>
        </Card>
      </div>
    );
  }

  const currentPlayer = gameState.players.find(p => p.id === playerId);
  
  // Team filtering
  const darkTeam = gameState.players.filter(p => p.team === "dark");
  const lightTeam = gameState.players.filter(p => p.team === "light");
  const noTeam = gameState.players.filter(p => p.team === null);
  
  // Check for spymasters
  const darkHasSpymaster = darkTeam.some(p => p.role === "spymaster");
  const lightHasSpymaster = lightTeam.some(p => p.role === "spymaster");
  
  const canStartGame = currentPlayer?.isRoomOwner && 
    darkHasSpymaster &&
    lightHasSpymaster &&
    darkTeam.length > 0 &&
    lightTeam.length > 0;

  const playerCount = gameState.players.length;

  return (
    <div className="h-screen bg-slate-900 animate-in fade-in duration-500 relative overflow-hidden flex flex-col" style={{ backgroundImage: 'url(/arkaplan.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      {/* Light Effects - Reduced for performance */}
      <div className="light-effect light-1" />
      <div className="light-effect light-2" />
      
      {/* Fewer particles for better performance */}
      {[...Array(15)].map((_, i) => (
        <div key={i} className={`particle particle-${i + 1}`} />
      ))}
      
      {/* Header Bar */}
      <div className="relative z-10 w-full">
        <div className="bg-slate-900/95 backdrop-blur-lg border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src="/logo.png" alt="Katmannames" className="h-10 w-auto" />
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-green-600/20 border border-green-600/50 rounded-full">
                    <span className="text-xs font-medium text-green-400">Lobide</span>
                  </div>
                  <div className="text-sm text-slate-400">
                    <Users className="inline w-4 h-4 mr-1" />
                    {playerCount} Oyuncu
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                  <span className="text-xs text-slate-400">Oda Kodu:</span>
                  <span className="text-lg font-mono font-bold text-white tracking-wider" data-testid="room-code">
                    {showRoomCode ? roomCode : "••••••"}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowRoomCode(!showRoomCode)}
                    className="h-6 w-6 p-0"
                  >
                    {showRoomCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyRoomCode}
                    className="h-6 w-6 p-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    send("leave_room", {});
                    localStorage.removeItem("katmannames_room_code");
                    localStorage.removeItem("katmannames_player_id");
                    setLocation("/rooms");
                  }}
                  className="h-9"
                  data-testid="button-leave-room"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Odadan Çık
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full p-4 flex flex-col">
          {/* Team Selection Area */}
          <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
            {/* Left Side - Team Cards */}
            <div className="flex-1 lg:w-3/5 flex flex-col gap-4">
              <PlayerList
                players={gameState.players}
                currentPlayerId={playerId}
                onTeamSelect={handleTeamSelect}
                onRoleToggle={handleRoleToggle}
                isLobby={true}
                darkTeamName={gameState.darkTeamName}
                lightTeamName={gameState.lightTeamName}
                onTeamNameChange={handleTeamNameChange}
                onRemoveBot={handleRemoveBot}
              />
            </div>

            {/* Right Sidebar */}
            <div className="lg:w-2/5 flex flex-col gap-4">
              {/* Start Game Card */}
              <Card className="p-4 border-2 bg-slate-800 border-green-600/50">
                {/* Game Start Requirements Visual Indicators */}
                {!canStartGame && currentPlayer?.isRoomOwner && (
                  <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-2">
                    <div className="text-sm font-bold text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Başlatma Gereksinimleri
                    </div>
                    <div className="text-xs space-y-1">
                      {!darkHasSpymaster && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <X className="w-3 h-3" />
                          <span>{gameState.darkTeamName} takımına İstihbarat Şefi gerekli</span>
                        </div>
                      )}
                      {!lightHasSpymaster && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <X className="w-3 h-3" />
                          <span>{gameState.lightTeamName} takımına İstihbarat Şefi gerekli</span>
                        </div>
                      )}
                      {darkTeam.length < 2 && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <X className="w-3 h-3" />
                          <span>{gameState.darkTeamName} takımında en az 2 oyuncu olmalı</span>
                        </div>
                      )}
                      {lightTeam.length < 2 && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <X className="w-3 h-3" />
                          <span>{gameState.lightTeamName} takımında en az 2 oyuncu olmalı</span>
                        </div>
                      )}
                      {noTeam.length > 0 && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <X className="w-3 h-3" />
                          <span>{noTeam.length} oyuncu takım seçmemiş</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Game Ready Status */}
                {canStartGame && currentPlayer?.isRoomOwner && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="text-sm font-bold text-green-600 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Oyun başlatmaya hazır!
                    </div>
                  </div>
                )}
              
                <Button
                  onClick={handleStartGame}
                  disabled={!canStartGame}
                  className={`w-full h-12 text-base font-bold transition-all mb-3 ${
                    canStartGame 
                      ? "bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 shadow-lg hover:shadow-xl group"
                      : "opacity-50"
                  }`}
                  size="lg"
                  variant={canStartGame ? "default" : "secondary"}
                  data-testid="button-start-game"
                >
                  {canStartGame ? (
                    <>
                      <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform animate-pulse" />
                      Oyunu Başlat
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Gereksinimler Karşılanmadı
                    </>
                  )}
                </Button>

              {/* Compact How to Play */}
              <div className="border-t pt-3 space-y-2">
                <h3 className="text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  Nasıl Oynanır?
                </h3>
                <ul className="text-[10px] sm:text-xs space-y-1 text-muted-foreground">
                  <li>1. Takım seçin</li>
                  <li>2. Rol seçin (İstihbarat Şefi / Ajan)</li>
                  <li>3. Her takımda en az bir İstihbarat Şefi olmalı</li>
                  <li>4. Oyunu başlatın!</li>
                </ul>
              </div>
            </Card>

            {/* Bot Controls - Compact */}
            {currentPlayer?.isRoomOwner && (
              <Card className="p-3 sm:p-4 space-y-2 border-2 bg-slate-800 border-amber-600/50">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold">Test Botları</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] font-semibold flex items-center gap-1 mb-1">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                      {gameState.darkTeamName}
                    </Label>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleAddBot("dark", "spymaster")}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-[10px] px-1 h-7"
                        data-testid="button-add-bot-dark-spymaster"
                      >
                        +Şef
                      </Button>
                      <Button
                        onClick={() => handleAddBot("dark", "guesser")}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-[10px] px-1 h-7"
                        data-testid="button-add-bot-dark-guesser"
                      >
                        +Ajan
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] font-semibold flex items-center gap-1 mb-1">
                      <div className="w-2 h-2 rounded-full bg-red-600" />
                      {gameState.lightTeamName}
                    </Label>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleAddBot("light", "spymaster")}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-[10px] px-1 h-7"
                        data-testid="button-add-bot-light-spymaster"
                      >
                        +Şef
                      </Button>
                      <Button
                        onClick={() => handleAddBot("light", "guesser")}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-[10px] px-1 h-7"
                        data-testid="button-add-bot-light-guesser"
                      >
                        +Ajan
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            </div>
          </div>
          
          {/* Bottom Settings Section - Only for Room Owner */}
          {currentPlayer?.isRoomOwner && (
            <div className="mt-6 space-y-4">
              {/* Chaos Mode - Prominent Section */}
              <Card className="p-6 border-4 bg-gradient-to-br from-red-950/90 via-purple-950/90 to-orange-950/90 border-red-600/70 relative overflow-hidden">
                {/* Experimental Badge */}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-amber-600 text-white text-xs px-2 py-1">
                    🧪 DENEYSEL
                  </Badge>
                </div>
                
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Sparkles className="w-8 h-8 text-red-500 animate-pulse" />
                        <Sparkles className="w-8 h-8 text-purple-500 absolute top-0 left-0 animate-pulse animation-delay-200" />
                      </div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
                        KAOS MODU
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-lg">
                      Klasik Codenames'e heyecanlı bir twist! Gizli roller ile oyuna stratejik derinlik ve belirsizlik katın.
                    </p>
                  </div>
                  <Switch
                    checked={chaosMode}
                    onCheckedChange={(checked) => {
                      setChaosMode(checked);
                      handleChaosModeUpdate(checked);
                    }}
                    className="scale-125"
                    data-testid="switch-chaos-mode"
                  />
                </div>
                
                {/* Detailed Explanation */}
                <div className={`space-y-4 transition-all duration-500 ${chaosMode ? 'opacity-100 max-h-96' : 'opacity-50 max-h-32 overflow-hidden'}`}>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🔮</span>
                        <h3 className="font-bold text-yellow-500">Kahin Ajan</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Her takımda 1 tane. Kendi takımının 3 kartını oyun başında bilir. 
                        Bu bilgiyi ipuçları ile takımına aktarmalı.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💀</span>
                        <h3 className="font-bold text-red-500">Dodo Ajanı</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Gizli hain! Takımını kaybettirmeye çalışır. 
                        Suikastçı kartı seçtirmeye çalışır. Sadece oy verebilir.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🎭</span>
                        <h3 className="font-bold text-purple-500">Çift Ajan</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Karşı takım için çalışır! Yanlış kartlara yönlendirir. 
                        Sadece oy verebilir, kart seçemez.
                      </p>
                    </div>
                  </div>
                  
                  {chaosMode && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-lg">
                      <div className="text-sm space-y-1">
                        <p className="font-semibold text-amber-400">⚡ Önemli Kurallar:</p>
                        <ul className="text-xs text-muted-foreground space-y-0.5 ml-4">
                          <li>• Dodo ve Çift Ajan her zaman zıt takımlarda olur</li>
                          <li>• Gizli roller oyun başladığında atanır ve sadece size gösterilir</li>
                          <li>• Kahin'in bildiği kartlar mor ışıltı ile gösterilir</li>
                          <li>• Takımlar birbirlerinin Kahin'ini tahmin edebilir (1 hak)</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setChaosMode(!chaosMode)}
                    className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
                  >
                    {chaosMode ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {chaosMode ? 'Daha az göster' : 'Daha fazla bilgi'}
                  </button>
                </div>
              </Card>
              
              {/* Timer Settings - Simpler Design */}
              <Card className="p-4 border-2 bg-slate-800 border-purple-600/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-purple-500" />
                    <h3 className="text-base font-bold">Zamanlayıcı Ayarları</h3>
                  </div>
                  <Switch
                    checked={timedMode}
                    onCheckedChange={(checked) => {
                      setTimedMode(checked);
                      handleTimerSettingsUpdate(checked, spymasterTime, guesserTime);
                    }}
                    data-testid="switch-timed-mode"
                  />
                </div>
                
                {timedMode && (
                  <div className="grid md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm">İstihbarat Şefi</Label>
                        <span className="text-sm font-mono text-purple-400">
                          {Math.floor(spymasterTime / 60)}:{(spymasterTime % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <Slider
                        value={[spymasterTime]}
                        onValueChange={([value]) => {
                          setSpymasterTime(value);
                        }}
                        onValueCommit={([value]) => {
                          handleTimerSettingsUpdate(timedMode, value, guesserTime);
                        }}
                        min={30}
                        max={600}
                        step={30}
                        className="w-full"
                        data-testid="slider-spymaster-time"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm">Ajanlar</Label>
                        <span className="text-sm font-mono text-purple-400">
                          {Math.floor(guesserTime / 60)}:{(guesserTime % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <Slider
                        value={[guesserTime]}
                        onValueChange={([value]) => {
                          setGuesserTime(value);
                        }}
                        onValueCommit={([value]) => {
                          handleTimerSettingsUpdate(timedMode, spymasterTime, value);
                        }}
                        min={30}
                        max={600}
                        step={30}
                        className="w-full"
                        data-testid="slider-guesser-time"
                      />
                    </div>
                  </div>
                )}
                
                {timedMode && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    ⏱️ Süre bittiğinde tur otomatik bitmez, sadece görsel uyarı verilir
                  </p>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* Team Name Warning Dialog */}
      <AlertDialog open={showTeamNameWarning} onOpenChange={setShowTeamNameWarning}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Takım İsimlerini Değiştirmek İster Misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Takım isimleri hala varsayılan değerlerde: "Katman Koyu" ve "Katman Açık".<br />
              Özel takım isimleri belirlemek ister misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İsimleri Değiştir</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStartWithDefaultNames}>
              Varsayılan İsimlerle Devam Et
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
