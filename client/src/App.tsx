import { useMemo, useState } from "react";
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Container,
	CssBaseline,
	IconButton,
	InputAdornment,
	LinearProgress,
	Link,
	Stack,
	TextField,
	ThemeProvider,
	Tooltip,
	Typography,
	createTheme,
	useMediaQuery,
} from "@mui/material";
import { DarkMode, LightMode, Search } from "@mui/icons-material";
import { motion } from "framer-motion";
import axios from "axios";
import type { PaletteMode } from "@mui/material";
import "./styles/App.scss";
import heroImg from "./assets/hero.png";

type RiskLevel = "düşük" | "orta" | "yüksek";

type MileageSection = {
	title: string;
	comment: string;
	score: number;
	riskLevel: RiskLevel;
};

type BodyPaintSection = {
	title: string;
	comment: string;
	riskLevel: RiskLevel;
};

type EngineDrivetrainSection = {
	title: string;
	comment: string;
	riskLevel: RiskLevel;
};

type PriceSection = {
	title: string;
	comment: string;
	score: number;
	isCheap: boolean;
	isOverpriced: boolean;
};

type ListingQualitySection = {
	title: string;
	comment: string;
	score: number;
};

type BuyRecommendationSection = {
	recommended: boolean;
	summary: string;
	conditionsToBuy: string[];
	reasonsToAvoid: string[];
};

type AnalysisSections = {
	mileage: MileageSection;
	bodyAndPaint: BodyPaintSection;
	engineAndDrivetrain: EngineDrivetrainSection;
	price: PriceSection;
	listingQuality: ListingQualitySection;
	buyRecommendation: BuyRecommendationSection;
};

type Analysis = {
	overallScore: number;
	overallComment: string;
	advantages: string[];
	disadvantages: string[];
	riskFlags: string[];
	maintenanceSuggestions: string[];
	sections: AnalysisSections;
};

type AnalysisResponse = {
	ad: {
		adNo: string;
		id: string | null;
		title: string | null;
		coverImageUrl: string | null;
		url: string;
	};
	analysis: Analysis;
};

const primaryYellow = "#FFE800";
const gray = "#3F475F";
const offWhite = "#F2F2F2";
const white = "#FFFFFF";

function riskColor(level: RiskLevel): "success" | "warning" | "error" {
	if (level === "düşük") return "success";
	if (level === "orta") return "warning";
	return "error";
}

function AnalysisView({ result, darkMode }: { result: AnalysisResponse; darkMode: boolean }) {
	const { ad, analysis } = result;
	const { sections } = analysis;

	return (
		<Box sx={{ mt: 3, position: "relative" }}>
			{/* Ad header */}
			<Box
				sx={{
					display: "flex",
					flexDirection: { xs: "column", sm: "row" },
					gap: 2.5,
					mb: 3,
				}}
			>
				<Box
					sx={{
						width: { xs: "100%", sm: 220 },
						borderRadius: 3,
						overflow: "hidden",
						bgcolor: darkMode ? "#020617" : offWhite,
					}}
				>
					{ad.coverImageUrl ? (
						<Box
							component="img"
							src={ad.coverImageUrl}
							alt={ad.title ?? "İlan kapağı"}
							sx={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
								display: "block",
							}}
						/>
					) : (
						<Box
							sx={{
								width: "100%",
								height: 160,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "text.secondary",
								fontSize: 13,
							}}
						>
							Kapak görseli bulunamadı
						</Box>
					)}
				</Box>

				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography
						variant="subtitle1"
						sx={{
							color: "text.secondary",
							mb: 0.5,
							fontWeight: 600,
							textTransform: "capitalize",
						}}
					>
						İlan #{ad.adNo}
					</Typography>
					<Typography
						variant="h6"
						sx={{
							fontWeight: 600,
							mb: 1,
						}}
					>
						{ad.title ?? "Başlık bulunamadı"}
					</Typography>
					<Link href={ad.url} target="_blank" rel="noreferrer" underline="hover" sx={{ fontSize: 14 }}>
						İlana git →
					</Link>

					{/* Overall score */}
					<Box
						sx={{
							mt: 2,
							display: "flex",
							flexDirection: { xs: "column", sm: "row" },
							gap: 2.5,
							alignItems: { xs: "flex-start", sm: "center" },
						}}
					>
						<Box
							sx={{
								minWidth: 160,
							}}
						>
							<Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 0.5 }}>
								Genel Skor
							</Typography>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 1.5,
								}}
							>
								<Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1 }}>
									{analysis.overallScore}
									<Typography component="span" variant="h6" sx={{ ml: 0.5, fontWeight: 500 }}>
										/100
									</Typography>
								</Typography>
							</Box>
							<LinearProgress
								variant="determinate"
								value={analysis.overallScore}
								sx={{
									mt: 1,
									height: 6,
									borderRadius: 999,
								}}
							/>
						</Box>

						<Typography variant="body2" sx={{ color: "text.secondary", flex: 1 }}>
							{analysis.overallComment}
						</Typography>
					</Box>
				</Box>
			</Box>

			{/* High-level lists */}
			<Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} sx={{ mb: 3 }}>
				<Box sx={{ flex: 1 }}>
					<Typography
						variant="subtitle1"
						sx={{
							mb: 0.75,
							color: "text.secondary",
							fontWeight: 600,
							textTransform: "capitalize",
						}}
					>
						Avantajlar
					</Typography>
					<Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2 }}>
						{analysis.advantages.map((item) => (
							<li key={item}>
								<Typography variant="body2">{item}</Typography>
							</li>
						))}
					</Stack>
				</Box>

				<Box sx={{ flex: 1 }}>
					<Typography
						variant="subtitle1"
						sx={{
							mb: 0.75,
							color: "text.secondary",
							fontWeight: 600,
							textTransform: "capitalize",
						}}
					>
						Dezavantajlar
					</Typography>
					<Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2 }}>
						{analysis.disadvantages.map((item) => (
							<li key={item}>
								<Typography variant="body2">{item}</Typography>
							</li>
						))}
					</Stack>
				</Box>
			</Stack>

			<Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} sx={{ mb: 3 }}>
				<Box sx={{ flex: 1 }}>
					<Typography
						variant="subtitle1"
						sx={{
							mb: 0.75,
							color: "text.secondary",
							fontWeight: 600,
							textTransform: "capitalize",
						}}
					>
						Riskler
					</Typography>
					<Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2 }}>
						{analysis.riskFlags.map((item) => (
							<li key={item}>
								<Typography variant="body2">{item}</Typography>
							</li>
						))}
					</Stack>
				</Box>

				<Box sx={{ flex: 1 }}>
					<Typography
						variant="subtitle1"
						sx={{
							mb: 0.75,
							color: "text.secondary",
							fontWeight: 600,
							textTransform: "capitalize",
						}}
					>
						Bakım / Pazarlık Önerileri
					</Typography>
					<Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2 }}>
						{analysis.maintenanceSuggestions.map((item) => (
							<li key={item}>
								<Typography variant="body2">{item}</Typography>
							</li>
						))}
					</Stack>
				</Box>
			</Stack>

			{/* Detailed sections */}
			<Stack direction={{ xs: "column", md: "row" }} spacing={2.5} sx={{ mb: 2.5 }}>
				{/* Mileage */}
				<Box
					sx={{
						flex: 1,
						p: 2,
						borderRadius: 3,
						bgcolor: darkMode ? "rgba(15,23,42,0.85)" : "#f9fafb",
					}}
				>
					<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 600, textTransform: "capitalize" }}>
							{sections.mileage.title}
						</Typography>
						<Chip
							label={`Risk: ${sections.mileage.riskLevel}`}
							size="small"
							color={riskColor(sections.mileage.riskLevel)}
							variant="outlined"
						/>
					</Stack>
					<Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
						{sections.mileage.comment}
					</Typography>
					<Typography variant="caption" sx={{ fontWeight: 500 }}>
						Kilometre skoru: {sections.mileage.score} / 100
					</Typography>
					<LinearProgress variant="determinate" value={sections.mileage.score} sx={{ mt: 0.5, height: 5, borderRadius: 999 }} />
				</Box>

				{/* Engine & drivetrain */}
				<Box
					sx={{
						flex: 1,
						p: 2,
						borderRadius: 3,
						bgcolor: darkMode ? "rgba(15,23,42,0.85)" : "#f9fafb",
					}}
				>
					<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 600, textTransform: "capitalize" }}>
							{sections.engineAndDrivetrain.title}
						</Typography>
						<Chip
							label={`Risk: ${sections.engineAndDrivetrain.riskLevel}`}
							size="small"
							color={riskColor(sections.engineAndDrivetrain.riskLevel)}
							variant="outlined"
						/>
					</Stack>
					<Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
						{sections.engineAndDrivetrain.comment}
					</Typography>
				</Box>
			</Stack>

			<Stack direction={{ xs: "column", md: "row" }} spacing={2.5} sx={{ mb: 2.5 }}>
				{/* Body & paint */}
				<Box
					sx={{
						flex: 1,
						p: 2,
						borderRadius: 3,
						bgcolor: darkMode ? "rgba(15,23,42,0.85)" : "#f9fafb",
					}}
				>
					<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 600, textTransform: "capitalize" }}>
							{sections.bodyAndPaint.title}
						</Typography>
						<Chip
							label={`Risk: ${sections.bodyAndPaint.riskLevel}`}
							size="small"
							color={riskColor(sections.bodyAndPaint.riskLevel)}
							variant="outlined"
						/>
					</Stack>
					<Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
						{sections.bodyAndPaint.comment}
					</Typography>
				</Box>

				{/* Price */}
				<Box
					sx={{
						flex: 1,
						p: 2,
						borderRadius: 3,
						bgcolor: darkMode ? "rgba(15,23,42,0.85)" : "#f9fafb",
					}}
				>
					<Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, textTransform: "capitalize" }}>
						{sections.price.title}
					</Typography>
					<Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
						{sections.price.comment}
					</Typography>
					<Stack direction="row" spacing={1} sx={{ mb: 1 }}>
						{sections.price.isCheap && <Chip label="Fiyat: Uygun" size="small" color="success" />}
						{sections.price.isOverpriced && <Chip label="Fiyat: Pahalı" size="small" color="error" />}
					</Stack>
					<Typography variant="caption" sx={{ fontWeight: 500 }}>
						Fiyat skoru: {sections.price.score} / 100
					</Typography>
					<LinearProgress variant="determinate" value={sections.price.score} sx={{ mt: 0.5, height: 5, borderRadius: 999 }} />
				</Box>
			</Stack>

			{/* Listing & recommendation */}
			<Stack direction={{ xs: "column", md: "row" }} spacing={2.5} sx={{ mb: 1 }}>
				<Box
					sx={{
						flex: 1,
						p: 2,
						borderRadius: 3,
						bgcolor: darkMode ? "rgba(15,23,42,0.85)" : "#f9fafb",
					}}
				>
					<Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, textTransform: "capitalize" }}>
						{sections.listingQuality.title}
					</Typography>
					<Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
						{sections.listingQuality.comment}
					</Typography>
					<Typography variant="caption" sx={{ fontWeight: 500 }}>
						İlan kalitesi skoru: {sections.listingQuality.score} / 100
					</Typography>
					<LinearProgress
						variant="determinate"
						value={sections.listingQuality.score}
						sx={{ mt: 0.5, height: 5, borderRadius: 999 }}
					/>
				</Box>

				<Box
					sx={{
						flex: 1,
						p: 2,
						borderRadius: 3,
						bgcolor: darkMode ? "rgba(15,23,42,0.85)" : "#f9fafb",
					}}
				>
					<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 600, textTransform: "capitalize" }}>
							Alınır mı?
						</Typography>
						<Chip
							label={sections.buyRecommendation.recommended ? "Evet" : "Hayır"}
							color={sections.buyRecommendation.recommended ? "success" : "error"}
							size="small"
						/>
					</Stack>

					<Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
						{sections.buyRecommendation.summary}
					</Typography>

					<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
						<Box sx={{ flex: 1 }}>
							<Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
								Şu şartlarda alınabilir
							</Typography>
							<Stack component="ul" spacing={0.25} sx={{ m: 0, pl: 2, mt: 0.5 }}>
								{sections.buyRecommendation.conditionsToBuy.map((c) => (
									<li key={c}>
										<Typography variant="body2">{c}</Typography>
									</li>
								))}
							</Stack>
						</Box>

						<Box sx={{ flex: 1 }}>
							<Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
								Uzak durmanız gereken durumlar
							</Typography>
							<Stack component="ul" spacing={0.25} sx={{ m: 0, pl: 2, mt: 0.5 }}>
								{sections.buyRecommendation.reasonsToAvoid.map((r) => (
									<li key={r}>
										<Typography variant="body2">{r}</Typography>
									</li>
								))}
							</Stack>
						</Box>
					</Stack>
				</Box>
			</Stack>

			<Box
				sx={{
					mt: 2.5,
					p: 1.5,
					borderRadius: 2,
					bgcolor: darkMode ? "rgba(15,23,42,0.9)" : "#f3f4f6",
				}}
			>
				<Typography variant="caption" sx={{ color: "text.secondary" }}>
					Bu analiz ilan verilerine dayalı olarak yapay zekâ tarafından oluşturulan otomatik bir ön değerlendirmedir. Araç
					hakkında kesin bir olumlu veya olumsuz yargı içermez. Nihai karar öncesinde aracın profesyonel bir ekspertiz tarafından
					incelenmesi tavsiye edilir.
				</Typography>
			</Box>
		</Box>
	);
}

function App() {
	const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
	const [mode, setMode] = useState<PaletteMode>(prefersDark ? "dark" : "light");
	const [adNo, setAdNo] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<AnalysisResponse | null>(null);

	const theme = useMemo(
		() =>
			createTheme({
				palette: {
					mode,
					primary: {
						main: primaryYellow,
					},
					secondary: {
						main: gray,
					},
					background: {
						default: mode === "dark" ? "#050711" : offWhite,
						paper: mode === "dark" ? "#101322" : white,
					},
					text: {
						primary: mode === "dark" ? white : "#111827",
						secondary: mode === "dark" ? "#e5e7eb" : "#4b5563",
					},
				},
				typography: {
					fontFamily: '"Hanken Grotesk", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
				},
				shape: {
					borderRadius: 14,
				},
			}),
		[mode],
	);

	const handleToggleTheme = () => {
		setMode((prev) => (prev === "dark" ? "light" : "dark"));
	};

	const handleSubmit = async () => {
		const trimmed = adNo.trim();
		if (!trimmed) {
			setError("Lütfen bir ilan numarası girin.");
			return;
		}

		setError(null);
		setLoading(true);
		setResult(null);

		try {
			const response = await axios.get<AnalysisResponse>(`http://localhost:3000/`, {
				params: { adNo: trimmed },
			});
			setResult(response.data);
		} catch (err: any) {
			const message = err?.response?.data?.message || err?.message || "Beklenmeyen bir hata oluştu.";
			setError(typeof message === "string" ? message : "İstek sırasında bir hata oluştu.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Box
				sx={{
					minHeight: "100vh",
					display: "flex",
					alignItems: "stretch",
					justifyContent: "center",
					background:
						mode === "dark"
							? "radial-gradient(circle at top left, rgba(255,232,0,0.12), transparent 55%), radial-gradient(circle at bottom right, rgba(63,71,95,0.6), #050711)"
							: "radial-gradient(circle at top left, rgba(255,232,0,0.4), #ffffff)",
					transition: "background 300ms ease",
				}}
			>
				<Container
					maxWidth="md"
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						py: 6,
					}}
				>
					<motion.div
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, ease: "easeOut" }}
						style={{ width: "100%" }}
					>
						<Box
							sx={{
								position: "relative",
								bgcolor: "background.paper",
								boxShadow: mode === "dark" ? "0 24px 80px rgba(0,0,0,0.65)" : "0 20px 60px rgba(15,23,42,0.18)",
								borderRadius: 4,
								px: { xs: 3, sm: 5 },
								py: { xs: 4, sm: 5 },
								overflow: "hidden",
							}}
						>
							<Box
								sx={{
									position: "absolute",
									inset: 0,
									pointerEvents: "none",
									background:
										mode === "dark"
											? "radial-gradient(circle at top right, rgba(255,232,0,0.16), transparent 55%)"
											: "radial-gradient(circle at top right, rgba(255,232,0,0.2), transparent 50%)",
									opacity: 0.9,
								}}
							/>

							<Box
								sx={{
									position: "relative",
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									mb: 3,
									gap: 2,
								}}
							>
								<Box>
									{/* <Typography
                    variant="overline"
                    sx={{
                      letterSpacing: '.18em',
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      fontSize: 11,
                    }}
                  >
                    sahibinden car review
                  </Typography> */}
									<Typography
										variant="h4"
										sx={{
											fontWeight: 700,
											mt: 0.5,
											display: "flex",
											alignItems: "baseline",
											gap: 1,
										}}
									>
										Yapay Zeka ile
										<Box component="span" sx={{ color: primaryYellow }}>
											Ekspertiz
										</Box>
									</Typography>
									<Typography variant="body2" sx={{ mt: 1, color: "text.secondary", maxWidth: 420 }}>
										Sahibinden.com'dan aldığın araç ilan numarasını gir, yapay zeka ile detaylı ekspertiz raporu hazırlayalım.
									</Typography>
								</Box>

								<Tooltip title={mode === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}>
									<IconButton
										onClick={handleToggleTheme}
										sx={{
											bgcolor: mode === "dark" ? "rgba(15,23,42,0.8)" : "rgba(15,23,42,0.04)",
											borderRadius: 999,
										}}
									>
										{mode === "dark" ? <LightMode sx={{ color: primaryYellow }} /> : <DarkMode sx={{ color: gray }} />}
									</IconButton>
								</Tooltip>
							</Box>

							<Box
								sx={{
									position: "relative",
									display: "flex",
									flexDirection: { xs: "column", sm: "row" },
									gap: 2,
									alignItems: { xs: "stretch", sm: "center" },
								}}
							>
								<TextField
									fullWidth
									label="İlan numarası"
									placeholder="Örn: 1304251115"
									value={adNo}
									onChange={(e) => setAdNo(e.target.value)}
									disabled={loading}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<Search
													sx={{
														color: "text.secondary",
														fontSize: 20,
													}}
												/>
											</InputAdornment>
										),
									}}
								/>

								<motion.div
									whileHover={loading ? {} : { y: -2, boxShadow: "0 14px 30px rgba(0,0,0,0.35)" }}
									whileTap={loading ? {} : { scale: 0.97 }}
									transition={{ duration: 0.15 }}
								>
									<Button
										onClick={handleSubmit}
										disabled={loading}
										sx={{
											whiteSpace: "nowrap",
											minWidth: 220,
											py: 1.4,
											px: 3,
											fontWeight: 600,
											letterSpacing: 0.3,
											borderRadius: 999,
											textTransform: "none",
											fontSize: 15,
											background: "linear-gradient(120deg, #FFE800, #facc15, #f97316)",
											color: "#111827",
											"&:hover": {
												background: "linear-gradient(120deg, #fde047, #eab308, #ea580c)",
											},
										}}
									>
										{loading ? (
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													gap: 1.5,
												}}
											>
												<CircularProgress size={20} sx={{ color: "#111827" }} />
												<span>Yapay zeka analiz ediyor…</span>
											</Box>
										) : (
											"Ekspertiz yap"
										)}
									</Button>
								</motion.div>
							</Box>

							{/* Hero image – only when no result yet */}
							{!result && (
								<Box
									sx={{
										mt: 3,
										borderRadius: "0 0 30px 30px",
										overflow: "hidden",
										maxHeight: 500,
									}}
								>
									<Box
										component="img"
										src={heroImg}
										alt="Yapay zeka ile araç ekspertizi"
										sx={{
											display: "block",
											width: "100%",
											height: "100%",
											objectFit: "cover",
										}}
									/>
								</Box>
							)}

							{error && (
								<Typography variant="body2" color="error" sx={{ mt: 2.5, position: "relative" }}>
									{error}
								</Typography>
							)}

							{result && <AnalysisView result={result} darkMode={mode === "dark"} />}
						</Box>
					</motion.div>
				</Container>
			</Box>
		</ThemeProvider>
	);
}

export default App;
