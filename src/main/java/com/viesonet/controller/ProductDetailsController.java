package com.viesonet.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.viesonet.entity.FavoriteProducts;
import com.viesonet.entity.Media;
import com.viesonet.entity.ProductColors;
import com.viesonet.entity.Products;
import com.viesonet.entity.Ratings;
import com.viesonet.entity.ViolationProducts;
import com.viesonet.service.FavoriteProductService;
import com.viesonet.service.MediaService;
import com.viesonet.service.OrdersService;
import com.viesonet.service.ProductColorsService;
import com.viesonet.entity.Colors;
import com.viesonet.service.ColorsService;
import com.viesonet.service.ProductsService;
import com.viesonet.service.RatingsService;
import com.viesonet.service.UsersService;
import com.viesonet.service.ViolationsService;
import com.viesonet.service.WordBannedService;

@RestController
@CrossOrigin("*")
public class ProductDetailsController {
    @Autowired
    ProductsService productsService;

    @Autowired
    RatingsService ratingsService;

    @Autowired
    UsersService usersService;

    @Autowired
    FavoriteProductService favoriteProductService;

    @Autowired
    WordBannedService wordBannedService;

    @Autowired
    OrdersService ordersService;

    @Autowired
    ColorsService colorsService;

    @Autowired
    MediaService mediaService;

    @Autowired
    ProductColorsService productColorsService;

    // @Autowired
    // ViolationProductsService violationProductsService;

    // @PostMapping("/report-product/{productId}")
    // public ViolationProducts reportProduct(@PathVariable int productId,
    // @RequestParam String reportContent) {
    // String userId =
    // SecurityContextHolder.getContext().getAuthentication().getName();
    // return
    // violationProductsService.reportProduct(usersService.findUserById(userId),
    // productsService.findProductById(productId),
    // reportContent);
    // }

    @GetMapping("/get-product/{productId}")
    public ResponseEntity<?> getProduct(@PathVariable int productId) {
        Products product = productsService.getProduct(productId);
        if (product != null) {
            return ResponseEntity.ok(product); // Trả về sản phẩm với trạng thái OK (200)
        } else {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Product not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @PostMapping("/rate-product/{productId}")
    public ResponseEntity<Ratings> rateProduct(@RequestBody Ratings ratingRequest, @PathVariable int productId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        ratingRequest.setUser(usersService.getUserById(userId));
        ratingRequest.setRatingContent(wordBannedService.wordBanned(ratingRequest.getRatingContent()));
        try {
            Ratings savedRating = ratingsService.rateProduct(ratingRequest, productsService.getProduct(productId));
            if (savedRating != null) {
                return ResponseEntity.ok(savedRating);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(null);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @PostMapping("/check-bought/{productId}")
    public boolean checkBought(@PathVariable int productId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ordersService.checkBought(userId, productId);
    }

    @GetMapping("/get-related-products/{userId}")
    public List<Products> getRelatedProducts(@PathVariable String userId) {
        return productsService.getRelatedProducts(userId);
    }

    @GetMapping("/get-favorite-product/{productId}")
    public boolean getFavotiteProducts(@PathVariable int productId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return favoriteProductService.getFavoriteProducts(userId, productId);
    }

    @PostMapping("/add-favorite-product/{productId}")
    public FavoriteProducts addFavoriteProduct(@PathVariable int productId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return favoriteProductService.addFavoriteProduct(usersService.findUserById(userId),
                productsService.getProduct(productId));
    }

    @GetMapping
    public List<Products> getAllProducts() {
        return productsService.getAllProducts();
    }

    @PostMapping("/products/add")
    public Products addProduct(@RequestBody Products product) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return productsService.addProduct(product, usersService.findUserById(userId));
    }

    @PostMapping("/send-media/{productId}")
    public Media sendMedia(@RequestParam List<String> mediaUrl,
            @PathVariable int productId) {
        Media obj = new Media();
        for (String fileUrl : mediaUrl) {
            boolean isImage = isImageUrl(fileUrl);
            obj = mediaService.addMedia(fileUrl, productsService.findProductById(productId), isImage);
        }
        return obj;
    }

    @PostMapping("/save-productcolor/{productId}")
    public ProductColors saveProductColor(@RequestParam int colorId, @RequestParam int quantity,
            @PathVariable int productId) {
        return productColorsService.saveProductColor(colorsService.findColorById(colorId),
                productsService.findProductById(productId), quantity);
    }

    private boolean isImageUrl(String fileUrl) {
        // Kiểm tra phần mở rộng của URL để xác định loại tệp tin
        String extension = fileUrl.substring(fileUrl.lastIndexOf(".") + 1).toLowerCase();
        if (extension.contains("mp4")) {
            return false;
        }
        return true;
    }

    @GetMapping("/products/color")
    public List<Colors> getAllColors() {
        return colorsService.getAllColors();
    }

}
